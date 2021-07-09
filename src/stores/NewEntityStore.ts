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

import { action, computed, makeObservable, observable } from 'mobx';
import { BoxEntity } from '../models/Box';
import { DictionaryEntity } from '../models/Dictionary';
import { RequestsStore } from './RequestsStore';
import { SchemaStore } from './SchemaStore';

const defaultNewDictionary: DictionaryEntity = {
	name: '',
	kind: 'Th2Dictionary',
	spec: {
		data: ''
	}
};

const defaultNewBox: BoxEntity = {
	name: '',
	kind: 'Th2Box',
	spec: {
		type: '',
		"image-name": '',
		"image-version": '',
		"node-port": undefined,
		'extended-settings': {
			service: {
				enabled: false,
			},
		}
	}
}

export enum EntityTypes {
	BOX = 'box',
	DICTIONARY = 'dictionary'
};

export class NewEntityStore {

	constructor(private requestsStore: RequestsStore, private schemaStore: SchemaStore) {
		makeObservable(this, {
			entityType: observable,
			newDictionary: observable,
			newBox: observable,
			boxTypes: computed,
			boxNames: computed,
			setEntityType: action,
			setNewDictionaryName: action,
			setNewDictionaryConfig: action,
			resetNewDictionary: action,
			addNewDictionary: action,
			setNewBoxName: action,
			setNewBoxImageName: action,
			setNewBoxImageVersion: action,
			setNewBoxType: action,
			setNewBoxNodePort: action,
			resetNewBox: action,
			addNewBox: action
		})
	}

	
	public get boxTypes(): string[] {
		return this.schemaStore.groupsConfig.flatMap(group => group.types)
	}

	public get boxNames(): string[] {
		return this.schemaStore.boxes.map(box => box.name)
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
		this.requestsStore.saveChanges().then(() => this.schemaStore.addDictionary(this.newDictionary));
		this.resetNewDictionary();
	}

	newBox: BoxEntity = defaultNewBox;

	setNewBoxName = (value: string) => {
		this.newBox = {...this.newBox, name: value}
	}

	setNewBoxImageName = (value: string) => {
		this.newBox = {...this.newBox, spec: {...this.newBox.spec, "image-name": value}}
	}

	setNewBoxImageVersion = (value: string) => {
		this.newBox = {...this.newBox, spec: {...this.newBox.spec, "image-version": value}}
	}

	setNewBoxType = (value: string) => {
		this.newBox = {...this.newBox, spec: {...this.newBox.spec, type: value}}
	}

	setNewBoxNodePort = (value: string) => {
		this.newBox = {...this.newBox, spec: {...this.newBox.spec, "node-port": +value}}
	}

	resetNewBox = () => {
		this.newBox = defaultNewBox;
	}

	addNewBox = () => {
		this.requestsStore.saveEntityChanges(this.newBox, 'add');
		this.requestsStore.saveChanges().then(() => this.schemaStore.addBox(this.newBox));
		this.resetNewBox();
	}
}
