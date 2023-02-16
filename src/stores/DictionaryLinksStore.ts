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

import { action, computed, makeObservable, observable, toJS } from 'mobx';
import {
	DictionaryLinksEntity,
	DictionaryRelation,
	isDictionaryLinksEntity,
	MultiDictionaryRelation,
} from '../models/Dictionary';
import FileBase from '../models/FileBase';
import { BoxesStore } from './BoxesStore';
import { RequestsStore } from './RequestsStore';
import { SelectedDictionaryStore } from './SelectedDictionaryStore';

export class DictionaryLinksStore {
	constructor(
		private requestsStore: RequestsStore,
		private selectedDictionaryStore: SelectedDictionaryStore,
		private boxesStore: BoxesStore,
	) {
		makeObservable(this, {
			dictionaryLinksEntity: observable,
			dictionaryRelations: computed,
			linkedBoxes: computed,
			linkedDictionaries: computed,
			addLinkDictionary: action,
			deleteLinkDictionary: action,
			deleteMultiLinkDictionary: action,
			setLinkDictionaries: action,
		});
	}

	dictionaryLinksEntity: DictionaryLinksEntity | null = null;

	public get dictionaryRelations(): DictionaryRelation[] {
		if (!this.dictionaryLinksEntity) {
			return [];
		}
		return this.dictionaryLinksEntity.spec['dictionariesRelation'];
	}

	public get multiDictionaryRelations(): MultiDictionaryRelation[] {
		if (
			!this.dictionaryLinksEntity ||
			!this.dictionaryLinksEntity.spec['multiDictionariesRelation']
		) {
			return [];
		}
		return this.dictionaryLinksEntity.spec['multiDictionariesRelation'];
	}

	public relatedDictionaryRelations = (box: string): MultiDictionaryRelation | undefined => {
		if (
			!this.dictionaryLinksEntity ||
			!this.dictionaryLinksEntity.spec['multiDictionariesRelation']
		) {
			return undefined;
		}
		return this.dictionaryLinksEntity.spec['multiDictionariesRelation'].find(
			relation => relation.box === box,
		);
	};

	public get linkedMultiBoxes(): MultiDictionaryRelation[] {
		return this.multiDictionaryRelations.filter(rel =>
			rel.dictionaries.find(dict => dict.name === this.selectedDictionaryStore.dictionary?.name),
		);
	}

	public get linkedBoxes(): DictionaryRelation[] {
		return this.dictionaryRelations.filter(
			rel => rel.dictionary.name === this.selectedDictionaryStore.dictionary?.name,
		);
	}

	public get linkedDictionaries(): DictionaryRelation[] {
		return this.dictionaryRelations.filter(rel => rel.box === this.boxesStore.selectedBox?.name);
	}

	public updateDictionariesRelationsToMulti = () => {
		const updatedLinks: Array<[link: DictionaryRelation, updatedLink: MultiDictionaryRelation]> =
			this.dictionaryRelations.map(link => {
				const updatedLink: MultiDictionaryRelation = {
					name: link.name,
					box: link.box,
					dictionaries: [
						{
							name: link.dictionary.name,
							alias: link.dictionary.type,
						},
					],
				};
				return [link, updatedLink];
			});
		updatedLinks.forEach(val => this.changeLinkDictionary(val[0], val[1]));
	};

	updateLinksDictionary = (boxName: string, updatedBoxName: string) => {
		this.dictionaryRelations
			.filter(link => link.box === boxName)
			.map(link => {
				const updatedLink = toJS(link);
				updatedLink.box = updatedBoxName;
				return [link, updatedLink];
			})
			.forEach(([link, updatedLink]) => {
				this.changeLinkDictionary(link, {
					name: updatedLink.name,
					box: updatedLink.box,
					dictionaries: [
						{
							name: updatedLink.dictionary.name,
							alias: updatedLink.dictionary.type,
						},
					],
				});
			});
		const relatedLink = this.multiDictionaryRelations.find(link => link.box === boxName);
		relatedLink && this.changeLinkDictionary(relatedLink, { ...relatedLink, box: updatedBoxName });
	};

	changeLinkDictionary = (
		link: DictionaryRelation | MultiDictionaryRelation,
		newLink: MultiDictionaryRelation,
	) => {
		if ('dictionaries' in link) this.deleteMultiLinkDictionary(link);
		else this.deleteLinkDictionary(link);

		this.addLinkDictionary(newLink);
	};

	addLinkDictionary = (link: MultiDictionaryRelation) => {
		if (this.dictionaryLinksEntity) {
			const relatedMultiLink = this.relatedDictionaryRelations(link.box);
			if (
				relatedMultiLink &&
				relatedMultiLink.dictionaries.length === link.dictionaries.length &&
				relatedMultiLink.dictionaries.filter(dictionary =>
					link.dictionaries.find(linkDictionary => linkDictionary.name === dictionary.name),
				).length === link.dictionaries.length
			)
				return;
			this.dictionaryLinksEntity = {
				...this.dictionaryLinksEntity,
				spec: {
					...this.dictionaryLinksEntity.spec,
					multiDictionariesRelation: relatedMultiLink
						? [
								...this.dictionaryLinksEntity.spec['multiDictionariesRelation'].filter(
									relation => relation.box !== link.box,
								),
								{
									...relatedMultiLink,
									dictionaries: [...relatedMultiLink.dictionaries, ...link.dictionaries],
								},
						  ]
						: [
								...this.dictionaryLinksEntity.spec['multiDictionariesRelation'].filter(
									relation => relation.box !== link.box,
								),
								link,
						  ],
				},
			};
			this.requestsStore.saveEntityChanges(this.dictionaryLinksEntity, 'update');
		}
	};

	deleteLinkDictionary = (link: DictionaryRelation) => {
		if (this.dictionaryLinksEntity) {
			const relatedMultiLink = this.relatedDictionaryRelations(link.box);
			this.dictionaryLinksEntity = {
				...this.dictionaryLinksEntity,
				spec: {
					dictionariesRelation: this.dictionaryLinksEntity.spec['dictionariesRelation'].filter(
						existedLink => link !== existedLink,
					),
					multiDictionariesRelation: relatedMultiLink
						? [
								...this.dictionaryLinksEntity.spec['multiDictionariesRelation'].filter(
									relation => relation.box !== link.box,
								),
								{
									...relatedMultiLink,
									dictionaries: relatedMultiLink.dictionaries.filter(
										dictionary => dictionary.name !== link.dictionary.name,
									),
								},
						  ]
						: this.dictionaryLinksEntity.spec['multiDictionariesRelation'],
				},
			};
			this.requestsStore.saveEntityChanges(this.dictionaryLinksEntity, 'update');
		}
	};

	deleteMultiLinkDictionary = (link: MultiDictionaryRelation) => {
		if (this.dictionaryLinksEntity) {
			const relatedMultiLink = this.relatedDictionaryRelations(link.box);
			this.dictionaryLinksEntity = {
				...this.dictionaryLinksEntity,
				spec: {
					dictionariesRelation: this.dictionaryLinksEntity.spec['dictionariesRelation'].filter(
						existedLink =>
							existedLink.box !== link.box ||
							!link.dictionaries.find(
								linkDictionary => linkDictionary.name === existedLink.dictionary.name,
							),
					),
					multiDictionariesRelation: relatedMultiLink
						? [
								...this.dictionaryLinksEntity.spec['multiDictionariesRelation'].filter(
									relation => relation.box !== link.box,
								),
								{
									...relatedMultiLink,
									dictionaries: relatedMultiLink.dictionaries.filter(
										dictionary =>
											!link.dictionaries.find(
												linkDictionary => linkDictionary.name === dictionary.name,
											),
									),
								},
						  ]
						: this.dictionaryLinksEntity.spec['multiDictionariesRelation'],
				},
			};
			this.requestsStore.saveEntityChanges(this.dictionaryLinksEntity, 'update');
		}
	};

	setLinkDictionaries = (allEntities: FileBase[]) => {
		const dictionaryLinksEntity = allEntities.filter(isDictionaryLinksEntity);
		if (dictionaryLinksEntity.length > 0) {
			this.dictionaryLinksEntity = dictionaryLinksEntity[0];
		}
	};
}
