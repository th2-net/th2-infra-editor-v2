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

import { observable, makeObservable, action } from 'mobx'
import { BoxSpecs } from '../models/Box';
import { DictionarySpecs } from '../models/Dictionary';
import FileBase, { ActionType, OtherSpecs } from '../models/FileBase';
import { EditableEntity, RequestsStore } from './RequestsStore';

export class EntityEditor {

	constructor(private requestsStore: RequestsStore) {
		makeObservable(this, {
			actionType: observable,
			entity: observable,
			setActionType: action,
			setEntity: action,
			setEntityName: action,
			setEntitySpecProperty: action,
		})
	}

	actionType: ActionType = 'update';

	entity: FileBase | null = null;

	setEntity = (entity: FileBase) => {
		this.entity = entity
	};

	setEntityName = (name: string) => {
		if (this.entity) {
			this.entity = {...this.entity, name};
		}
	}

	setEntitySpecProperty = <T extends keyof BoxSpecs | DictionarySpecs | OtherSpecs, V extends string>(prop: T, value: V) => {
		const newValue =
			prop !== 'extended-settings' && prop !== 'pins' && prop !== 'custom-config'
				? value
				: JSON.parse(value)
		
		if (this.entity && this.entity.spec) {
			this.entity = {
				...this.entity,
				spec: {
					...(this.entity.spec as BoxSpecs | DictionarySpecs | OtherSpecs),
					[prop as any]: newValue
				}
			};
		}
	}

	setActionType = (actionType: ActionType) => {
		this.actionType = actionType;
	}

	apply = () => {
		if (this.entity) {
			this.requestsStore.saveEntityChanges(this.entity as EditableEntity, this.actionType)
			this.requestsStore.saveChanges();
		}
	}
}
