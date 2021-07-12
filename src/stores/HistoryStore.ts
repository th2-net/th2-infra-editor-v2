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

import { action, computed, makeObservable, observable } from 'mobx';
import { Snapshot } from '../models/History';
import Stack from '../models/Stack';
import { SchemaStore } from './SchemaStore';

export default class HistoryStore {
	constructor(private schemaStore: SchemaStore) {
		makeObservable<HistoryStore, 'historyStack'>(this, {
			historyStack: observable,
			lastAppliedSnapshot: observable,
			history: computed,
			addSnapshot: action,
			clearHistory: action,
		});
	}

	private historyStack = new Stack<Snapshot>();

	public lastAppliedSnapshot: Snapshot | null = null;

	public get history(): Snapshot[] {
		return this.historyStack.storage;
	}

	public addSnapshot = (snapshot: Snapshot) => {
		this.historyStack.push(snapshot);
	};

	public clearHistory = () => {
		this.historyStack.clear();
	};
}
