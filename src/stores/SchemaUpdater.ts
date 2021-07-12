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

import { cloneDeep, remove } from 'lodash';
import { toJS } from 'mobx';
import { ExtendedConnectionOwner } from '../models/Box';
import { Link, LinksDefinition } from '../models/LinksDefinition';
import { SchemaStore } from './SchemaStore';

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

export class SchemaUpdater {
	constructor(private schema: SchemaStore) {}

	updateLinks = (boxName: string, updatedBoxName: string) => {
		this.schema.boxesRelation
			.filter(link => link.from.box === boxName || link.to.box === boxName)
			.map(link => {
				const updatedLink = toJS(link);
				updatedLink.from.box =
					updatedLink.from.box === boxName ? updatedBoxName : updatedLink.from.box;
				updatedLink.to.box = updatedLink.to.box === boxName ? updatedBoxName : updatedLink.to.box;
				return [link, updatedLink];
			})
			.forEach(([link, updatedLink]) => {
				this.changeLink(link, updatedLink);
			});
	};

	changeLink = (
		link: Link<ExtendedConnectionOwner>,
		newLink: Link<ExtendedConnectionOwner>,
		createSnapshot = true,
	) => {
		this.deleteLink(link);
		this.addLink(newLink);

		const oldValue = cloneDeep(toJS(link));
		const newValue = cloneDeep(toJS(newLink));

		const changedLinkBox = this.findBoxRelationLink(newLink);

		if (createSnapshot && changedLinkBox) {
			this.schema.saveEntityChanges(changedLinkBox, 'update');
			this.schema.history.addSnapshot({
				object: oldValue.name,
				type: 'link',
				operation: 'change',
				changeList: [
					{
						object: oldValue.name,
						from: oldValue,
						to: newValue,
					},
				],
			});
		}
	};

	deleteLink = async (linkToRemove: Link<ExtendedConnectionOwner>, createSnapshot = true) => {
		const changedLink = this.findBoxRelationLink(linkToRemove);

		if (changedLink) {
			if (changedLink.spec['boxes-relation']) {
				const connectionType = `router-${linkToRemove.from.connectionType}` as const;
				remove(
					changedLink.spec['boxes-relation'][connectionType],
					link => link.name === linkToRemove.name,
				);
			}

			if (createSnapshot) {
				this.schema.saveEntityChanges(changedLink, 'update');
				this.schema.history.addSnapshot({
					object: linkToRemove.name,
					type: 'link',
					operation: 'remove',
					changeList: [
						{
							object: linkToRemove.name,
							from: linkToRemove,
							to: null,
						},
					],
				});
			}
		}
	};

	addLink(link: Link<ExtendedConnectionOwner>, createSnapshot = true) {
		let editorGeneratedLink = this.schema.linkBoxes.find(
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
			this.schema.linkBoxes.push(editorGeneratedLink);
			oprationType = 'add';
		}

		if (createSnapshot) {
			this.schema.saveEntityChanges(editorGeneratedLink, oprationType);
			this.schema.history.addSnapshot({
				object: link.name,
				type: 'link',
				operation: 'add',
				changeList: [
					{
						object: link.name,
						from: null,
						to: link,
					},
				],
			});
		}
	}

	private findBoxRelationLink = (
		targetLink: Link<ExtendedConnectionOwner>,
	): LinksDefinition | null => {
		return (
			this.schema.linkBoxes.find(linkBox => {
				const links =
					linkBox.spec['boxes-relation']?.[
						`router-${targetLink.from.connectionType}` as 'router-mq' | 'router-grpc'
					];
				return links?.some(link => link.name === targetLink.name);
			}) || null
		);
	};
}
