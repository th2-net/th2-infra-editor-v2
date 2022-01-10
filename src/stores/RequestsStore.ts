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

import { isEqual } from 'lodash';
import { action, computed, makeObservable, observable } from 'mobx';
import Api from '../api/api';
import { BoxEntity } from '../models/Box';
import { DictionaryEntity, DictionaryLinksEntity } from '../models/Dictionary';
import { RequestModel } from '../models/FileBase';
import { LinksDefinition } from '../models/LinksDefinition';
import { SchemaStore } from './SchemaStore';

export class RequestsStore {
	constructor(private api: Api, private schemaStore: SchemaStore) {
		makeObservable(this, {
			isSaving: observable,
			preparedRequests: observable,
			selectedSchemaName: computed,
			requestsExist: computed,
			saveChanges: action,
			saveEntityChanges: action,
		});
	}

	isSaving = false;

	preparedRequests: RequestModel[] = [];

	public get selectedSchemaName(): string | null {
		return this.schemaStore.selectedSchemaName;
	}

	public get requestsExist(): boolean {
		return this.preparedRequests.length > 0
	}

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

	saveChanges = async () => {
		if (!this.selectedSchemaName || this.preparedRequests.length === 0) return;
		try {
			this.isSaving = true;
			await this.api.sendSchemaRequest(this.selectedSchemaName, this.preparedRequests);
			this.preparedRequests = [];
		} catch (error) {
			alert("Couldn't save changes");
		} finally {
			this.isSaving = false;
		}
	};
}
