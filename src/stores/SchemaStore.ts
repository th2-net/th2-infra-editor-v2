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

import { action, flow, flowResult, makeObservable, observable } from 'mobx';
import { CancellablePromise } from 'mobx/dist/internal';
import Api from '../api/api';
import { isSettingsEntity, Schema, SchemaSettings } from '../models/Schema';
import { BoxesStore } from './BoxesStore';
import { BoxUpdater } from './BoxUpdater';
import { DictionaryLinksStore } from './DictionaryLinksStore';
import { RequestsStore } from './RequestsStore';
import { SelectedDictionaryStore } from './SelectedDictionaryStore';
import HistoryStore from './HistoryStore';
import { isDictionaryEntity } from '../models/Dictionary';
import { RootStore } from './RootStore';
import { isBoxEntity } from '../models/Box';
import SubscriptionStore from './SubscriptionStore';
import { chain } from 'lodash';

export class SchemaStore {
	boxesStore = new BoxesStore();

	history = new HistoryStore(this);

	requestsStore: RequestsStore;

	selectedDictionaryStore: SelectedDictionaryStore;

	boxUpdater: BoxUpdater;

	dictionaryLinksStore: DictionaryLinksStore;

	subscriptionStore: SubscriptionStore;

	schemaSettings: SchemaSettings | null;

	constructor(private api: Api, private readonly rootStore: RootStore) {
		makeObservable(this, {
			boxesStore: observable,
			selectSchema: action,
			schemas: observable,
			selectedSchemaName: observable,
			selectedSchema: observable,
			isLoading: observable,
			schemaSettings: observable,
			fetchSchemaState: flow,
		});

		this.requestsStore = new RequestsStore(api, this);

		this.selectedDictionaryStore = new SelectedDictionaryStore(this.requestsStore);

		this.boxUpdater = new BoxUpdater(this.requestsStore, this.boxesStore, this.history);

		this.dictionaryLinksStore = new DictionaryLinksStore(
			this.requestsStore,
			this.selectedDictionaryStore,
			this.boxesStore,
		);

		this.subscriptionStore = new SubscriptionStore(this.api, this);

		this.schemaSettings = null;
	}

	schemas: string[] = [];

	selectedSchemaName: string | null = null;

	selectedSchema: Schema | null = null;

	isLoading = false;

	fetchSchemas = flow(function* (this: SchemaStore) {
		this.isLoading = true;

		try {
			this.schemas = yield this.api.fetchSchemasList();
		} catch (error) {
			if (error instanceof DOMException && error.code === error.ABORT_ERR) {
				console.error('Error occured while loading schemas');
				console.error(error);
			}
		}
	});

	fetchSchemaState = function* (this: SchemaStore, schemaName: string) {
		this.isLoading = true;

		try {
			const schema: Schema = yield this.api.fetchSchemaState(schemaName);

			this.selectedSchema = schema;
			this.boxesStore.setBoxes(schema.resources);
			this.boxesStore.setDictionaries(schema.resources);
			this.boxUpdater.setLinkDefinitions(schema.resources);
			this.dictionaryLinksStore.setLinkDictionaries(schema.resources);
			this.schemaSettings = chain(schema.resources).filter(isSettingsEntity).head().value();
		} catch (error) {
			if (error instanceof DOMException && error.code === error.ABORT_ERR) {
				console.error(`Error occured while fetching schema ${schemaName}`, error);
			}
		} finally {
			this.isLoading = false;
		}
	};

	private currentSchemaRequest: CancellablePromise<void> | null = null;

	selectSchema = (schemaName: string): CancellablePromise<void> => {
		this.selectedSchemaName = schemaName;
		this.clearEntities();
		this.currentSchemaRequest?.cancel();
		this.currentSchemaRequest = flowResult(this.fetchSchemaState(schemaName));

		return this.currentSchemaRequest;
	};

	private clearEntities = () => {
		this.boxesStore.setBoxes([]);
		this.boxesStore.selectBox(null);
		this.boxesStore.setDictionaries([]);
		this.selectedDictionaryStore.selectDictionary(null);
		this.boxUpdater.setLinkDefinitions([]);
	};

	private selectEntityFromURLParams = () => {
		const { object } = this.rootStore.urlParamsStore;

		if (object) {
			const resource = this.selectedSchema?.resources.find(resource => resource.name === object);

			if (resource) {
				if (isBoxEntity(resource)) {
					this.boxesStore.selectBox(resource);
					this.rootStore.appViewStore.setViewType('box');
				} else if (isDictionaryEntity(resource)) {
					this.selectedDictionaryStore.selectDictionary(resource);
					this.rootStore.appViewStore.setViewType('dictionary');
				}
			}
		}
	};

	async init() {
		await this.fetchSchemas();

		const { schema } = this.rootStore.urlParamsStore;

		if (schema && this.schemas.includes(schema)) {
			await this.selectSchema(schema);
			this.selectEntityFromURLParams();
		} else if (this.schemas.length > 0) {
			this.selectSchema(this.schemas[0]);
		}
	}
}
