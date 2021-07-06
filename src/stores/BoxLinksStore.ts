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

import { chain, Dictionary, keyBy, mapValues, sortBy, uniqBy } from "lodash";
import { action, computed, makeObservable, observable } from "mobx";
import { IBoxConnections, IPinConnections } from "../components/links/BoxConnections";
import { convertToExtendedLink } from "../helpers/link";
import { BoxEntity, ExtendedConnectionOwner, isBoxEntity } from "../models/Box";
import FileBase from "../models/FileBase";
import { isBoxLinksDefinition, Link, LinksDefinition } from "../models/LinksDefinition";
import { BoxesStore } from "./BoxesStore";
import { RequestsStore } from "./RequestsStore";
import { SelectedBoxStore } from "./SelectedBoxStore";

export class BoxLinksStore {

	linkBoxes: LinksDefinition[] = [];

	public get links(): Link<ExtendedConnectionOwner>[] {
		if (this.linkBoxes === null) return [];

		return this.linkBoxes.flatMap(linkBox => {
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

	public get separatedLinks(): Array<IBoxConnections | null> {
		const selectedBox = this.selectedBoxStore.box
		if (selectedBox) {
			const boxesMap = mapValues(keyBy(this.boxesStore.boxes, 'name'));

			return [
				resolveBoxLinks(selectedBox, boxesMap, this.links, 'to', 2),
				resolveBoxLinks(selectedBox, boxesMap, this.links, 'from', 2),
			];
		}

		return [null, null];
	}

	constructor(
		private requestsStore: RequestsStore,
		private selectedBoxStore: SelectedBoxStore,
		private boxesStore: BoxesStore
	) {
		makeObservable(this, {
			linkBoxes: observable,
			links: computed,
			separatedLinks: computed,
			setLinkBoxes: action
		});
	}

	setLinkBoxes = (allEntities: FileBase[]) => {
		this.linkBoxes = allEntities.filter(isBoxLinksDefinition);
	}
}

function resolveBoxLinks(
	box: BoxEntity,
	boxesMap: Dictionary<BoxEntity>,
	links: Link<ExtendedConnectionOwner>[],
	direction: 'to' | 'from',
	depth = 2,
	currentDepth = 0,
): IBoxConnections {
	const oppositeDirection = direction === 'to' ? 'from' : 'to';
	const connectedLinks = links.filter(
		link => link[direction].box === box.name && boxesMap[link[oppositeDirection].box],
	);
	const connectedPins = connectedLinks.map(link => link[direction].pin);
	const pins = (box.spec.pins || []).filter(pin => connectedPins.includes(pin.name));

	let boxes: IPinConnections[] =
		currentDepth === depth
			? []
			: pins.map(pin => ({
					pin,
					boxes: chain(connectedLinks)
						.filter(link => link[direction].pin === pin.name)
						.map(link => boxesMap[link[oppositeDirection].box])
						.uniqBy('name')
						.filter(isBoxEntity)
						.sortBy('name')
						.map(box => resolveBoxLinks(box, boxesMap, links, direction, depth, currentDepth + 1))
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

