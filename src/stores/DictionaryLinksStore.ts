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

import { action, computed, makeObservable, observable, reaction } from "mobx";
import { DictionaryLinksEntity, DictionaryRelation, isDictionaryLinksEntity } from "../models/Dictionary";
import FileBase from "../models/FileBase";
import { BoxesStore } from "./BoxesStore";
import { RequestsStore } from "./RequestsStore";
import { SelectedDictionaryStore } from "./SelectedDictionaryStore";

export class DictionaryLinksStore {

	constructor(
		private requestsStore: RequestsStore,
		private selectedDictionaryStore: SelectedDictionaryStore,
		private boxesStore: BoxesStore
	) {
		makeObservable(this, {
			dictionaryLinksEntity: observable,
			dictionaryRelations: computed,
			linkedBoxes: computed,
			linkedDictionaries: computed,
			addLinkDictionary: action,
			deleteLinkDictionary: action,
			setLinkDictionaries: action
		});
	}

	dictionaryLinksEntity: DictionaryLinksEntity | null = null;

	public get dictionaryRelations(): DictionaryRelation[] {
		if (!this.dictionaryLinksEntity) {
			return [];
		}
		return this.dictionaryLinksEntity.spec['dictionaries-relation'];
	}

	public get linkedBoxes(): DictionaryRelation[] {
		return this.dictionaryRelations.filter(rel => rel.dictionary.name === this.selectedDictionaryStore.dictionary?.name);
	}

	public get linkedDictionaries(): DictionaryRelation[] {
		return this.dictionaryRelations.filter(rel => rel.box === this.boxesStore.selectedBox?.name);
	}

	addLinkDictionary = (link: DictionaryRelation) => {
		if (
			this.dictionaryLinksEntity && 
			this.dictionaryRelations.findIndex(existedLink => link.dictionary.name === existedLink.dictionary.name && link.name === existedLink.name) === -1
		) {
			this.dictionaryLinksEntity = {
				...this.dictionaryLinksEntity,
				spec: {
					"dictionaries-relation": [...this.dictionaryLinksEntity.spec['dictionaries-relation'], link]
				}
			}
			this.requestsStore.saveEntityChanges(this.dictionaryLinksEntity, 'update');
		}
	}

	deleteLinkDictionary = (link: DictionaryRelation) => {
		if (this.dictionaryLinksEntity) {
			this.dictionaryLinksEntity = {
				...this.dictionaryLinksEntity,
				spec: {
					"dictionaries-relation": this.dictionaryLinksEntity.spec['dictionaries-relation'].filter(existedLink => link !== existedLink)
				}
			}
			this.requestsStore.saveEntityChanges(this.dictionaryLinksEntity, 'update');
		}
	}

	setLinkDictionaries = (allEntities: FileBase[]) => {
		const dictionaryLinksEntity = allEntities.filter(isDictionaryLinksEntity);
		if (dictionaryLinksEntity.length > 0) {
			this.dictionaryLinksEntity = dictionaryLinksEntity[0];
		}
	}
}
