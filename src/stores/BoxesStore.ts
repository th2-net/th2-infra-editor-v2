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

import { action, computed, makeObservable, observable } from "mobx";
import { BoxEntity, isBoxEntity } from "../models/Box";
import { DictionaryEntity, isDictionaryEntity } from "../models/Dictionary";
import { RequestsStore } from "./RequestsStore";
import FileBase from "../models/FileBase";

export class BoxesStore {
	
	constructor(private requestsStore: RequestsStore) {
		makeObservable(this, {
			selectedBox: observable,
			selectBox: action,
			boxes: observable,
			dictionaries: observable,
			allEntities: computed,
			setBoxes: action,
			setDictionaries: action
		});
	}

	readonly groupsConfig = [
		{
			title: 'conn',
			types: ['th2-conn', 'th2-read', 'th2-hand'],
			color: '#FF9966',
		},
		{
			title: 'codec',
			types: ['th2-codec'],
			color: '#66CC91',
		},
		{
			title: 'act',
			types: ['th2-act'],
			color: '#666DCC',
		},
		{
			title: 'check',
			types: ['th2-check1', 'th2-check2-recon'],
			color: '#C066CC',
		},
		{
			title: 'script',
			types: ['th2-script'],
			color: '#669966',
		},
		{
			title: 'Th2Resources',
			types: ['th2-rpt-viewer', 'th2-rpt-provider'],
			color: '#CACC66',
		},
	];

	selectedBox: BoxEntity | null = null;
	
	selectBox = (box: BoxEntity | null) => {
		this.selectedBox = box;
	};

	boxes: BoxEntity[] = [];

	dictionaries: DictionaryEntity[] = [];

	public get allEntities() {
		return [...this.boxes, ...this.dictionaries];
	}

	setBoxes = (allEntites: FileBase[]) => {
		this.boxes = allEntites.filter(isBoxEntity);
	}

	setDictionaries = (allEntites: FileBase[]) => {
		this.dictionaries = allEntites.filter(isDictionaryEntity);
	}

}
