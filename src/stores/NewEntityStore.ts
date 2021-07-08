/** *****************************************************************************
 * Copyright 2020-2020 Exactpro (Exactpro Systems Limited)
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
 *  limitations under the License.
 ***************************************************************************** */

import { action, makeObservable, observable, reaction, computed } from 'mobx';
import { DictionaryEntity } from '../models/Dictionary';
import { RequestsStore } from './RequestsStore';

const defaultNewDictionary: DictionaryEntity = {
	name: '',
	kind: 'TH2Dictionary',
	spec: {
		data: ''
	}
};

export enum EntityTypes {
	BOX = 'box',
	DICTIONARY = 'dictionary'
};

export class NewEntityStore {

	constructor(private requestsStore: RequestsStore) {
		makeObservable(this, {
			entityType: observable,
			newDictionary: observable,
			setEntityType: action,
			setNewDictionaryName: action,
			setNewDictionaryConfig: action,
			resetNewDictionary: action
		})
	}

	entityType: EntityTypes = EntityTypes.BOX;

	setEntityType = (entityType: EntityTypes) => {
		this.entityType = entityType;
	}

	newDictionary: DictionaryEntity = defaultNewDictionary;

	setNewDictionaryName = (value: string) => {
		this.newDictionary = {...this.newDictionary, name: value};
	}

	setNewDictionaryConfig = (value: string) => {
		this.newDictionary = {...this.newDictionary, spec: {
			data: value
		}}
	}

	resetNewDictionary = () => {
		this.newDictionary = defaultNewDictionary;
	}

	addNewDictionary = () => {
		this.requestsStore.saveEntityChanges(this.newDictionary, 'add');
		this.requestsStore.saveChanges();
	}
}
