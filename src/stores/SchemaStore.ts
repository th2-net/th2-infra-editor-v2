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

import { action, flow, flowResult, makeObservable, observable, computed } from 'mobx';
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
import { InvalidLink } from '../helpers/pinConnections';
import AppViewType from '../util/AppViewType';

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
		makeObservable<SchemaStore, 'fetchSchemasFlow' | 'fetchSchemaStateFlow'>(this, {
			boxesStore: observable,
			selectSchema: action,
			schemas: observable,
			selectedSchemaName: observable,
			selectedSchema: observable,
			isLoading: observable,
			schemaSettings: observable,
			fetchSchemaStateFlow: flow,
			fetchSchemasFlow: flow,
			isSchemaValid: computed,
			invalidLinks: computed,
			backupInvalidLinks: observable,
		});

		this.requestsStore = new RequestsStore(api, this);

		this.selectedDictionaryStore = new SelectedDictionaryStore(this.requestsStore);

		this.dictionaryLinksStore = new DictionaryLinksStore(
			this.requestsStore,
			this.selectedDictionaryStore,
			this.boxesStore,
		);

		this.boxUpdater = new BoxUpdater(
			this.requestsStore,
			this.boxesStore,
			this.history,
			this.dictionaryLinksStore,
		);

		this.subscriptionStore = new SubscriptionStore(this.api, this);

		this.schemaSettings = null;
	}

	public fetchSchema = (schemaName: string | null) => {
		if (schemaName === null) return undefined;
		return this.api.fetchSchemaState(schemaName);
	}

	public get invalidLinks(): InvalidLink[] {
		const invalidLinks: InvalidLink[] = [];
		this.boxUpdater.links.forEach(link => {
			var invalidLink: InvalidLink = {
				link: link,
				lostBoxes: [],
				lostPins: [],
			};
			for (let i = 0; i < 2; i++) {
				const box = this.boxesStore.boxes.find(
					box => box.name === (i === 0 ? link.from?.box : link.to?.box),
				);
				if (box === undefined) {
					invalidLink.lostBoxes.push({
						box: i === 0 ? link.from?.box || '' : link.to?.box || '',
					});
				} else {
					const pins = box.spec.pins?.find(
						pin => pin.name === (i === 0 ? link.from?.pin : link.to?.pin),
					);
					if (pins === undefined) {
						invalidLink.lostPins.push({
							pin: i === 0 ? link.from?.pin || '' : link.to?.pin || '',
							box: box.name,
						});
					}
				}
			}
			if (invalidLink.lostBoxes.length > 0 || invalidLink.lostPins.length > 0) {
				invalidLinks.push(invalidLink);
			}
		});
		return invalidLinks;
	}

	backupInvalidLinks: InvalidLink[] = [];

	public get isSchemaValid(): boolean {
		return !this.invalidLinks.find(link => link.lostBoxes.length + link.lostPins.length > 0);
	}

	schemas: string[] = [];

	selectedSchemaName: string | null = null;

	selectedSchema: Schema | null = null;

	isLoading = false;

	fetchSchemas = () => {
		return flowResult(this.fetchSchemasFlow());
	};

	private *fetchSchemasFlow(this: SchemaStore) {
		this.isLoading = true;

		try {
			this.schemas = yield this.api.fetchSchemasList();
		} catch (error) {
			if (error instanceof DOMException && error.code !== error.ABORT_ERR) {
				console.error('Error occured while loading schemas');
				console.error(error);
			}
		}
	}

	fetchSchemaState = (schemaName: string) => {
		return flowResult(this.fetchSchemaStateFlow(schemaName));
	};

	private *fetchSchemaStateFlow(this: SchemaStore, schemaName: string) {
		this.isLoading = true;

		try {
			const schema: Schema = yield this.api.fetchSchemaState(schemaName);

			this.selectedSchema = schema;
			this.boxesStore.setBoxes(schema.resources);
			this.boxesStore.setDictionaries(schema.resources);
			this.boxUpdater.setLinkDefinitions(schema.resources);
			this.dictionaryLinksStore.setLinkDictionaries(schema.resources);
			this.schemaSettings = chain(schema.resources).filter(isSettingsEntity).head().value();
			this.backupInvalidLinks = this.invalidLinks.concat();
		} catch (error) {
			if (error instanceof DOMException && error.code !== error.ABORT_ERR) {
				console.error(`Error occured while fetching schema ${schemaName}`, error);
			}
		} finally {
			this.isLoading = false;
		}
	}

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
					this.rootStore.appViewStore.setViewType(AppViewType.BoxView);
				} else if (isDictionaryEntity(resource)) {
					this.selectedDictionaryStore.selectDictionary(resource);
					this.rootStore.appViewStore.setViewType(AppViewType.DictionaryView);
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
