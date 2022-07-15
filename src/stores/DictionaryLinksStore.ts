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
			addMultiLinkDictionary: action,
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
		return this.dictionaryLinksEntity.spec['dictionaries-relation'];
	}

	public get multiDictionaryRelations(): MultiDictionaryRelation[] {
		if (
			!this.dictionaryLinksEntity ||
			!this.dictionaryLinksEntity.spec['multi-dictionaries-relation']
		) {
			return [];
		}
		return this.dictionaryLinksEntity.spec['multi-dictionaries-relation'];
	}

	public relatedDictionaryRelations = (box: string): MultiDictionaryRelation | undefined => {
		if (
			!this.dictionaryLinksEntity ||
			!this.dictionaryLinksEntity.spec['multi-dictionaries-relation']
		) {
			return undefined;
		}
		return this.dictionaryLinksEntity.spec['multi-dictionaries-relation'].find(
			relation => relation.box === box,
		);
	};
	public get linkedBoxes(): DictionaryRelation[] {
		return this.dictionaryRelations.filter(
			rel => rel.dictionary.name === this.selectedDictionaryStore.dictionary?.name,
		);
	}

	public get linkedDictionaries(): DictionaryRelation[] {
		return this.dictionaryRelations.filter(rel => rel.box === this.boxesStore.selectedBox?.name);
	}

	updateLinksDictionary = (boxName: string, updatedBoxName: string) => {
		this.dictionaryRelations
			.filter(link => link.box === boxName)
			.map(link => {
				const updatedLink = toJS(link);
				updatedLink.box = updatedBoxName;
				return [link, updatedLink];
			})
			.forEach(([link, updatedLink]) => {
				this.changeLinkDictionary(link, updatedLink);
			});
		const relatedLink = this.multiDictionaryRelations.find(link => link.box === boxName);
		relatedLink && this.changeLinkDictionary(relatedLink, { ...relatedLink, box: updatedBoxName });
	};

	changeLinkDictionary = (
		link: DictionaryRelation | MultiDictionaryRelation,
		newLink: DictionaryRelation | MultiDictionaryRelation,
	) => {
		if ('dictionaries' in link) this.deleteMultiLinkDictionary(link);
		else this.deleteLinkDictionary(link);

		if ('dictionaries' in newLink) this.addMultiLinkDictionary(newLink);
		else this.addLinkDictionary(newLink);
	};

	addLinkDictionary = (link: DictionaryRelation) => {
		const relatedMultiLink = this.relatedDictionaryRelations(link.box);
		if (
			this.dictionaryLinksEntity &&
			this.dictionaryRelations.findIndex(
				existedLink =>
					link.dictionary.name === existedLink.dictionary.name && link.name === existedLink.name,
			) === -1 &&
			(!relatedMultiLink ||
				relatedMultiLink.dictionaries.findIndex(
					dictionary => dictionary.name === link.dictionary.name,
				) === -1)
		) {
			console.log(relatedMultiLink, this.dictionaryLinksEntity.spec['multi-dictionaries-relation']);
			this.dictionaryLinksEntity = {
				...this.dictionaryLinksEntity,
				spec: {
					'dictionaries-relation': [
						...this.dictionaryLinksEntity.spec['dictionaries-relation'],
						link,
					],
					'multi-dictionaries-relation': relatedMultiLink
						? [
								...this.dictionaryLinksEntity.spec['multi-dictionaries-relation'].filter(
									relation => relation.box !== relatedMultiLink.box,
								),
								{
									...relatedMultiLink,
									dictionaries: relatedMultiLink.dictionaries.find(
										dictionary => dictionary.name === link.dictionary.name,
									)
										? relatedMultiLink.dictionaries
										: [
												...relatedMultiLink?.dictionaries,
												{
													name: link.dictionary.name,
													alias: link.dictionary.type,
												},
										  ],
								},
						  ]
						: this.dictionaryLinksEntity.spec['multi-dictionaries-relation']
						? [
								...this.dictionaryLinksEntity.spec['multi-dictionaries-relation'].filter(
									relation => relation.box !== link.box,
								),
								{
									box: link.box,
									name: link.name,
									dictionaries: [
										{
											name: link.dictionary.name,
											alias: link.dictionary.type,
										},
									],
								},
						  ]
						: [
								{
									box: link.box,
									name: link.name,
									dictionaries: [
										{
											name: link.dictionary.name,
											alias: link.dictionary.type,
										},
									],
								},
						  ],
				},
			};
			this.requestsStore.saveEntityChanges(this.dictionaryLinksEntity, 'update');
		}
	};

	addMultiLinkDictionary = (link: MultiDictionaryRelation) => {
		if (this.dictionaryLinksEntity) {
			const relatedMultiLink = this.relatedDictionaryRelations(link.box);
			if (
				!relatedMultiLink ||
				(relatedMultiLink.dictionaries.length === link.dictionaries.length &&
					relatedMultiLink.dictionaries.filter(dictionary =>
						link.dictionaries.find(linkDictionary => linkDictionary.name === dictionary.name),
					).length === link.dictionaries.length)
			)
				return;
			this.dictionaryLinksEntity = {
				...this.dictionaryLinksEntity,
				spec: {
					'dictionaries-relation': [
						...this.dictionaryLinksEntity.spec['dictionaries-relation'],
						...link.dictionaries.map(dictionary => {
							return {
								name: link.name,
								box: link.box,
								dictionary: {
									name: dictionary.name,
									type: dictionary.alias,
								},
							};
						}),
					],
					'multi-dictionaries-relation': relatedMultiLink
						? [
								...this.dictionaryLinksEntity.spec['multi-dictionaries-relation'].filter(
									relation => relation.box !== link.box,
								),
								{
									...relatedMultiLink,
									dictionaries: link.dictionaries,
								},
						  ]
						: [
								...this.dictionaryLinksEntity.spec['multi-dictionaries-relation'].filter(
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
					'dictionaries-relation': this.dictionaryLinksEntity.spec['dictionaries-relation'].filter(
						existedLink => link !== existedLink,
					),
					'multi-dictionaries-relation': relatedMultiLink
						? [
								...this.dictionaryLinksEntity.spec['multi-dictionaries-relation'].filter(
									relation => relation.box !== link.box,
								),
								{
									...relatedMultiLink,
									dictionaries: relatedMultiLink.dictionaries.filter(
										dictionary => dictionary.name !== link.dictionary.name,
									),
								},
						  ]
						: this.dictionaryLinksEntity.spec['multi-dictionaries-relation'],
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
					'dictionaries-relation': this.dictionaryLinksEntity.spec['dictionaries-relation'].filter(
						existedLink =>
							existedLink.box !== link.box ||
							!link.dictionaries.find(
								linkDictionary => linkDictionary.name === existedLink.dictionary.name,
							),
					),
					'multi-dictionaries-relation': relatedMultiLink
						? [
								...this.dictionaryLinksEntity.spec['multi-dictionaries-relation'].filter(
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
						: this.dictionaryLinksEntity.spec['multi-dictionaries-relation'],
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
