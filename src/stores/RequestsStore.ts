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
import { nanoid } from 'nanoid';
import Api from '../api/api';
import { getObjectKeys } from '../helpers/object';
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
			discardChanges: action,
		});
	}

	isSaving = false;

	preparedRequests: RequestModel[] = [];

	public get selectedSchemaName(): string | null {
		return this.schemaStore.selectedSchemaName;
	}

	public get requestsExist(): boolean {
		return this.preparedRequests.length > 0;
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
			this.preparedRequests = [
				...this.preparedRequests.filter(request => request.payload.name !== entity.name),
				{
					operation,
					payload: entity,
				}
			]
		}
	};

	saveChanges = async () => {
		this.schemaStore.dictionaryLinksStore.updateDictionariesRelationsToMulti();
		this.schemaStore.clearNonExistingLinks();
		if (!this.selectedSchemaName || this.preparedRequests.length === 0) return;
		try {
			this.isSaving = true;
			const response = await this.api.sendSchemaRequest(
				this.selectedSchemaName,
				this.preparedRequests,
			);
			const validationErrors = response.validationErrors;
			if (!response.commitRef && validationErrors) {
				getObjectKeys(validationErrors.linkErrorMessages).forEach(links =>
					validationErrors.linkErrorMessages[links].forEach(linkError => {
						this.schemaStore.addMessage({
							type: 'error',
							notificationType: 'linkErrorMessage',
							id: nanoid(),
							linkName: linkError.linkName,
							message: linkError.message,
							from: linkError.from,
							to: linkError.to,
						});
					}),
				);
				validationErrors.boxResourceErrorMessages.forEach(boxResourceError => {
					this.schemaStore.addMessage({
						type: 'error',
						notificationType: 'boxResourceErrorMessage',
						id: nanoid(),
						box: boxResourceError.box,
						message: boxResourceError.message,
					});
				});
				validationErrors.exceptionMessages.forEach(linkError => {
					this.schemaStore.addMessage({
						type: 'error',
						notificationType: 'exceptionMessage',
						id: nanoid(),
						message: linkError,
					});
				});
			}
			this.preparedRequests = [];
		} catch (error) {
			alert("Couldn't save changes");
		} finally {
			this.isSaving = false;
		}
	};

	discardChanges = () => {
		this.preparedRequests = [];
		this.schemaStore.backupInvalidLinks.forEach(link =>
			this.schemaStore.boxUpdater.addLink(link.link, false),
		);
	};
}
