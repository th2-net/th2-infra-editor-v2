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

import { isEqual } from 'lodash';
import { action, makeObservable, observable, flow, reaction, computed, toJS } from 'mobx';
import { CancellablePromise } from 'mobx/dist/internal';
import Api from '../api/api';
import { convertToExtendedLink } from '../helpers/link';
import { BoxEntity, ExtendedConnectionOwner, isBoxEntity } from '../models/Box';
import { DictionaryEntity, DictionaryLinksEntity, isDictionaryEntity } from '../models/Dictionary';
import { RequestModel } from '../models/FileBase';
import { isLinksDefinition, Link, LinksDefinition } from '../models/LinksDefinition';
import { Schema } from '../models/Schema';
import HistoryStore from './HistoryStore';
import { SchemaUpdater } from './SchemaUpdater';

export class SchemaStore {
	readonly groupsConfig = [
		{
			title: 'conn',
			types: ['th2-conn', 'th2-read', 'th2-hand'],
			color: '#FF9966',
		},
		{
			title: 'codec',
			types: ['th2-codec'],
			color: '#66CC91',
		},
		{
			title: 'act',
			types: ['th2-act'],
			color: '#666DCC',
		},
		{
			title: 'check',
			types: ['th2-check1', 'th2-check2-recon'],
			color: '#C066CC',
		},
		{
			title: 'script',
			types: ['th2-script'],
			color: '#669966',
		},
		{
			title: 'Th2Resources',
			types: ['th2-rpt-viewer', 'th2-rpt-provider'],
			color: '#CACC66',
		},
	];

	schemaUpdater = new SchemaUpdater(this);

	history = new HistoryStore(this);

	preparedRequests: RequestModel[] = [];

	boxes: BoxEntity[] = [];

	dictionaries: DictionaryEntity[] = [];

	schemas: string[] = [];

	selectedSchema: string | null = null;

	selectedDictionary: DictionaryEntity | null = null;

	isLoading = false;

	selectedBox: BoxEntity | null = null;

	linkBoxes: LinksDefinition[] = [];

	constructor(private api: Api) {
		makeObservable(this, {
			boxes: observable,
			dictionaries: observable,
			selectSchema: action,
			selectDictionary: action,
			schemas: observable,
			selectedSchema: observable,
			selectedDictionary: observable,
			isLoading: observable,
			selectedBox: observable,
			selectBox: action,
			boxesRelation: computed,
			linkBoxes: observable,
			saveBoxChanges: action,
			preparedRequests: observable,
		});

		reaction(() => this.selectedSchema, this.onSchemaChange);
	}

	public get boxesRelation(): Link<ExtendedConnectionOwner>[] {
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

	fetchSchemas = flow(function* (this: SchemaStore) {
		this.isLoading = true;

		try {
			this.schemas = yield this.api.fetchSchemasList();
			if (this.schemas.length > 0) {
				this.selectSchema(this.schemas[0]);
			}
		} catch (error) {
			if (error.name !== 'AbortError') {
				console.error('Error occured while loading schemas');
				console.error(error);
			}
		}
	});

	fetchSchemaState = flow(function* (this: SchemaStore, schemaName: string) {
		this.isLoading = true;

		try {
			const schema: Schema = yield this.api.fetchSchemaState(schemaName);

			this.boxes = schema.resources.filter(isBoxEntity);
			this.dictionaries = schema.resources.filter(isDictionaryEntity);
			this.linkBoxes = schema.resources.filter(isLinksDefinition);
		} catch (error) {
			if (error.name !== 'AbortError') {
				console.error(`Error occured while fetching schema ${schemaName}`, error);
			}
		} finally {
			this.isLoading = false;
		}
	});

	selectSchema = (schema: string) => {
		this.selectedSchema = schema;
	};

	selectBox = (selectedBox: BoxEntity | null) => {
		this.selectedBox = selectedBox;
	};
	
	selectDictionary = (dictionary: DictionaryEntity | null) => {
		this.selectedDictionary = dictionary;
	};

	saveBoxChanges = (box: BoxEntity, updatedBox: BoxEntity) => {
		if (box.name !== updatedBox.name && this.boxes.find(box => box.name === updatedBox.name)) {
			alert(`Box "${updatedBox.name}" already exists`);
			return;
		}

		const hasChanges = !isEqual(toJS(box), updatedBox);

		if (hasChanges) {
			if (box.name !== updatedBox.name) {
				this.boxes = [...this.boxes.filter(b => b.name !== box.name), updatedBox];
				this.schemaUpdater.updateLinks(box.name, updatedBox.name);
				// TODO: update dictionaries
			}

			if (box.name === this.selectedBox?.name) {
				this.selectBox(observable(updatedBox));
			}
		}

		// TODO: add changes to change list
	};

	private currentSchemaRequest: CancellablePromise<void> | null = null;

	private onSchemaChange = (selectedSchema: string | null) => {
		this.currentSchemaRequest?.cancel();
		this.currentSchemaRequest = selectedSchema ? this.fetchSchemaState(selectedSchema) : null;
		this.selectedBox = null;
		this.boxes = [];
		this.linkBoxes = [];
		this.dictionaries = [];
	};

	saveEntityChanges = (
		entity: BoxEntity | LinksDefinition | DictionaryLinksEntity | DictionaryEntity,
		operation: 'add' | 'update' | 'remove',
	) => {
		if (
			!this.preparedRequests.some(
				request =>
					request.payload.name === entity.name &&
					request.operation === operation &&
					isEqual(request.payload, entity),
			)
		) {
			this.preparedRequests.push({
				operation,
				payload: entity,
			});
		}
	};
}
