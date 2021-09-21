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

import { action, flow, makeObservable, observable, reaction } from 'mobx';
import { CancellablePromise } from 'mobx/dist/internal';
import Api from '../api/api';
import { isSettingsEntity, Schema, SchemaSettings } from '../models/Schema';
import { BoxesStore } from './BoxesStore';
import { BoxUpdater } from './BoxUpdater';
import { DictionaryLinksStore } from './DictionaryLinksStore';
import { RequestsStore } from './RequestsStore';
import { SelectedDictionaryStore } from './SelectedDictionaryStore';
import HistoryStore from './HistoryStore';
import { chain } from 'lodash';
import SubscriptionStore from './SubscriptionStore';

export class SchemaStore {

	boxesStore = new BoxesStore();

	history = new HistoryStore(this);

	requestsStore: RequestsStore;

	selectedDictionaryStore: SelectedDictionaryStore;

	boxUpdater: BoxUpdater;

	dictionaryLinksStore: DictionaryLinksStore;

	subscriptionStore: SubscriptionStore;

	schemaSettings: SchemaSettings | null;

	schemas: string[] = [];

	selectedSchema: string | null = null;

	isLoading = false;

	public fetchSchemaState = flow(function* (this: SchemaStore, schemaName: string) {
		this.isLoading = true;

		try {
			const schema: Schema = yield this.api.fetchSchemaState(schemaName);
			this.boxesStore.setBoxes(schema.resources);
			this.boxesStore.setDictionaries(schema.resources);
			this.boxUpdater.setLinkDefinitions(schema.resources);
			this.dictionaryLinksStore.setLinkDictionaries(schema.resources);
			this.schemaSettings = chain(schema.resources).filter(isSettingsEntity).head().value();
		} catch (error) {
			if (error.name !== 'AbortError') {
				console.error(`Error occured while fetching schema ${schemaName}`, error);
			}
		} finally {
			this.isLoading = false;
		}
	});
	private currentSchemaRequest: CancellablePromise<void> | null = null;

	constructor(private api: Api) {
		makeObservable(this, {
			selectSchema: action,
			schemas: observable,
			selectedSchema: observable,
			isLoading: observable,
			fetchSchemaState: action,
		});

		this.requestsStore = new RequestsStore(api, this);

		this.selectedDictionaryStore = new SelectedDictionaryStore(this.requestsStore);

		this.boxUpdater = new BoxUpdater(
			this.requestsStore,
			this.boxesStore,
			this.history,
		);

		this.dictionaryLinksStore = new DictionaryLinksStore(
			this.requestsStore,
			this.selectedDictionaryStore,
			this.boxesStore,
		);

		this.subscriptionStore = new SubscriptionStore(
			this.api,
			this,
		);

		this.schemaSettings = null;

		reaction(() => this.selectedSchema, this.onSchemaChange);
	}

	selectSchema = (schema: string) => {
		this.selectedSchema = schema;
	};

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

	private onSchemaChange = (selectedSchema: string | null) => {
		this.currentSchemaRequest?.cancel();
		this.currentSchemaRequest = selectedSchema ? this.fetchSchemaState(selectedSchema) : null;
		this.boxesStore.setBoxes([]);
		this.boxesStore.selectBox(null);
		this.boxesStore.setDictionaries([]);
		this.selectedDictionaryStore.selectDictionary(null);
		this.boxUpdater.setLinkDefinitions([]);
	};
}
