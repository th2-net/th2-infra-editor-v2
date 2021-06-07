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

import { action, makeObservable, observable } from 'mobx';

export default class Stack<T> {
	constructor() {
		makeObservable(this, {
			storage: observable,
			push: action,
			clear: action,
		});
	}

	public storage: T[] = [];

	public pointer = -1;

	push(value: T) {
		if (this.pointer === this.storage.length - 1) {
			this.storage.push(value);
			this.pointer++;
		} else {
			this.storage = [...this.storage.slice(0, this.pointer + 1), value];
			this.pointer++;
		}
	}

	getPreviousElement(): T | null {
		if (this.pointer - 1 < -1) return null;
		return this.storage[this.pointer--];
	}

	getNextElement(): T | null {
		if (this.pointer + 1 >= this.storage.length) return null;
		return this.storage[++this.pointer];
	}

	clear() {
		this.storage = [];
		this.pointer = -1;
	}
}
