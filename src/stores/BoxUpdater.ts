/** *****************************************************************************
 * Copyright 2009-2020 Exactpro (Exactpro Systems Limited)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************** */

import {
	chain,
	Dictionary,
	keyBy,
	mapValues,
	sortBy,
	uniqBy,
	cloneDeep,
	remove,
	isEqual
} from "lodash";
import { action, computed, makeObservable, observable, toJS } from "mobx";
import { IBoxConnections, IPinConnections } from "../components/links/BoxConnections";
import { convertToExtendedLink } from "../helpers/link";
import { BoxEntity, ExtendedConnectionOwner, isBoxEntity } from "../models/Box";
import FileBase from "../models/FileBase";
import { ConnectionDirection, isBoxLinksDefinition, Link, LinksDefinition } from "../models/LinksDefinition";
import { BoxesStore } from "./BoxesStore";
import HistoryStore from "./HistoryStore";
import { RequestsStore } from "./RequestsStore";
import { DictionaryLinksStore } from './DictionaryLinksStore';

const editorLink: Readonly<LinksDefinition> = {
	kind: 'Th2Link',
	name: 'editor-generated-links',
	spec: {
		'boxes-relation': {
			'router-grpc': [],
			'router-mq': [],
		},
	},
};

export class BoxUpdater {
	linkDefinitions: LinksDefinition[] = [];

	constructor(
		private requestsStore: RequestsStore,
		private boxesStore: BoxesStore,
		private history: HistoryStore,
		private dictionaryLinksStore: DictionaryLinksStore
	) {
		makeObservable(this, {
			linkDefinitions: observable,
			links: computed,
			selectedBoxConnections: computed,
			setLinkDefinitions: action,
			changeLink: action,
			addLink: action,
			deleteLink: action,
			saveBoxChanges: action,
		});
	}

	public get links(): Link<ExtendedConnectionOwner>[] {
		if (this.linkDefinitions === null) return [];

		return this.linkDefinitions.flatMap(linkBox => {
			if (linkBox.spec['boxes-relation']) {
				return [
					...(linkBox.spec['boxes-relation']['router-mq']
						? linkBox.spec['boxes-relation']['router-mq'].map(link =>
								convertToExtendedLink(link, 'mq'),
						  )
						: []),
					...(linkBox.spec['boxes-relation']['router-grpc']
						? linkBox.spec['boxes-relation']['router-grpc'].map(link =>
								convertToExtendedLink(link, 'grpc'),
						  )
						: []),
				];
			}
			return [];
		});
	}

	public get selectedBoxConnections(): [IBoxConnections, IBoxConnections] | [null, null] {
		const selectedBox = this.boxesStore.selectedBox;
		if (selectedBox) {
			const boxesMap = mapValues(keyBy(this.boxesStore.boxes, 'name'));

			return [
				this.resolveBoxLinks(selectedBox, boxesMap, this.links, 'to', 2),
				this.resolveBoxLinks(selectedBox, boxesMap, this.links, 'from', 2),
			];
		}

		return [null, null];
	}

	setLinkDefinitions = (allEntities: FileBase[]) => {
		this.linkDefinitions = allEntities.filter(isBoxLinksDefinition);
	};

	resolveBoxLinks(
		box: BoxEntity,
		boxesMap: Dictionary<BoxEntity>,
		links: Link<ExtendedConnectionOwner>[],
		direction: ConnectionDirection,
		depth = 2,
		currentDepth = 0,
	): IBoxConnections {
		const oppositeDirection = direction === 'to' ? 'from' : 'to';
		const connectedLinks = links.filter(
			link => link[direction]?.box === box.name && boxesMap[link[oppositeDirection]?.box || ''],
		);
		const connectedPins = connectedLinks.map(link => link[direction]?.pin);
		const pins = (box.spec.pins || []).filter(pin => connectedPins.includes(pin.name));

		let boxes: IPinConnections[] =
			currentDepth === depth
				? []
				: pins.map(pin => ({
						pin,
						boxes: chain(connectedLinks)
							.filter(link => link[direction]?.pin === pin.name)
							.map(link => boxesMap[link[oppositeDirection]?.box || ''])
							.uniqBy('name')
							.filter(isBoxEntity)
							.sortBy('name')
							.map(box =>
								this.resolveBoxLinks(box, boxesMap, links, direction, depth, currentDepth + 1),
							)
							.value(),
				  }));

		boxes = boxes.reduce((acc, curr) => {
			const pin = acc.find(b => b.pin.name === curr.pin.name);
			if (pin) {
				pin.boxes = uniqBy([...pin.boxes, ...curr.boxes], 'name');
				return acc;
			}
			return [...acc, curr];
		}, [] as IPinConnections[]);

		const boxLinks: IBoxConnections = {
			box,
			direction,
			pins: sortBy(boxes, 'pin.name').filter(pinConnections => pinConnections.boxes.length > 0),
		};

		return boxLinks;
	}

	updateLinks = (boxName: string, updatedBoxName: string) => {
		this.links
			.filter(link => link.from?.box === boxName || link.to?.box === boxName)
			.map(link => {
				const updatedLink = toJS(link);
				if (updatedLink.from) {
					updatedLink.from.box =
						updatedLink.from.box === boxName ? updatedBoxName : updatedLink.from.box;
				}
				if (updatedLink.to) {
					updatedLink.to.box = updatedLink.to.box === boxName ? updatedBoxName : updatedLink.to.box;
				}
				return [link, updatedLink];
			})
			.forEach(([link, updatedLink]) => {
				this.changeLink(link, updatedLink);
			});
	};

	changeLink = (
		link: Link<ExtendedConnectionOwner>,
		newLink: Link<ExtendedConnectionOwner>,
	) => {
		this.deleteLink(link, false);
		this.addLink(newLink, false);

		const changedLinkBox = this.findBoxRelationLink(newLink);

		if (changedLinkBox) {
			this.requestsStore.saveEntityChanges(changedLinkBox, 'update');
		}
	};

	deleteLink = async (linkToRemove: Link<ExtendedConnectionOwner>, saveChanges = true) => {
		const changedLink = this.findBoxRelationLink(linkToRemove);

		if (changedLink) {
			if (changedLink.spec['boxes-relation'] && linkToRemove.from) {
				const connectionType = `router-${linkToRemove.from.connectionType}` as const;
				remove(
					changedLink.spec['boxes-relation'][connectionType],
					link => link.name === linkToRemove.name,
				);
			}

			if (saveChanges) {
				this.requestsStore.saveEntityChanges(changedLink, 'update');
			}
		}
	};

	addLink(link: Link<ExtendedConnectionOwner>, saveChanges = true) {
		if (!link.from) {
			throw new Error("'from' field shouldn't be undefined");
		}

		let editorGeneratedLink = this.linkDefinitions.find(
			linkBox => linkBox.name === editorLink.name,
		);
		const linkConnectionType = `router-${link.from.connectionType}` as const;
		let oprationType: 'add' | 'update';

		if (editorGeneratedLink && editorGeneratedLink.spec['boxes-relation']) {
			editorGeneratedLink.spec['boxes-relation'][linkConnectionType].push(link);
			oprationType = 'update';
		} else {
			editorGeneratedLink = cloneDeep(editorLink);
			editorGeneratedLink.spec!['boxes-relation']![linkConnectionType].push(link);
			this.linkDefinitions.push(editorGeneratedLink);
			oprationType = 'add';
		}

		if (saveChanges) {
			this.requestsStore.saveEntityChanges(editorGeneratedLink, oprationType);
		}
	}

	createBox = (box: BoxEntity) => {
		if (this.boxesStore.boxes.find(b => b.name === box.name)) {
			alert(`Box "${box.name}" already exists`);
			return;
		}

		this.boxesStore.boxes.push(box);
		this.requestsStore.saveEntityChanges(box, 'add');
	}

	saveBoxChanges = (box: BoxEntity, updatedBox: BoxEntity) => {
		if (
			box.name !== updatedBox.name &&
			this.boxesStore.boxes.find(box => box.name === updatedBox.name)
		) {
			alert(`Box "${updatedBox.name}" already exists`);
			return;
		}

		const hasChanges = !isEqual(toJS(box), updatedBox);

		if (hasChanges) {
			const boxIndex = this.boxesStore.boxes.findIndex((b) => b.name === box.name);

			if (boxIndex === -1) throw new Error(`Cannot find box with name "${box.name}"`);

			this.boxesStore.boxes = [
				...this.boxesStore.boxes.slice(0, boxIndex),
				updatedBox,
				...this.boxesStore.boxes.slice(boxIndex + 1),
			];

			if (box.name !== updatedBox.name) {
				this.updateLinks(box.name, updatedBox.name);
				this.dictionaryLinksStore.updateLinksDictionary(box.name, updatedBox.name);
			}

			if (box.name === this.boxesStore.selectedBox?.name) {
				this.boxesStore.selectBox(observable(updatedBox));
			}

			this.requestsStore.saveEntityChanges(updatedBox, 'update');
		}
	};

	private findBoxRelationLink = (
		targetLink: Link<ExtendedConnectionOwner>,
	): LinksDefinition | null => {
		return (
			this.linkDefinitions.find(linkBox => {
				const links = targetLink.from
					? linkBox.spec['boxes-relation']?.[
							`router-${targetLink.from.connectionType}` as 'router-mq' | 'router-grpc'
					  ]
					: [];
				return links?.some(link => link.name === targetLink.name);
			}) || null
		);
	};
}
