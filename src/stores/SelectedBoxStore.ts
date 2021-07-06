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

import { action, makeObservable, observable } from "mobx";
import { BoxEntity } from "../models/Box";
import { RequestsStore } from "./RequestsStore";

export class SelectedBoxStore {

	box: BoxEntity | null = null;

	constructor(private requestsStore: RequestsStore) {
		makeObservable(this, {
			box: observable,
			selectBox: action,
		});
	}
	
	selectBox = (box: BoxEntity | null) => {
		this.box = box;
	};

}
 