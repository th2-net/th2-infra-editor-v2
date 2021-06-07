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

import { BoxEntity, ExtendedConnectionOwner } from './Box';
import { DictionaryEntity } from './Dictionary';
import { Link } from './LinksDefinition';

export interface Snapshot {
	object: string;
	type: 'box' | 'link' | 'dictionary';
	operation: 'add' | 'remove' | 'change';
	changeList: Change[];
}

export interface Change {
	object: string;
	from: BoxEntity | Link<ExtendedConnectionOwner> | DictionaryEntity | null;
	to: BoxEntity | Link<ExtendedConnectionOwner> | DictionaryEntity | null;
}

export interface DetailedDiff {
	added: BoxEntity | DictionaryEntity;
	deleted: BoxEntity | DictionaryEntity;
	updated: BoxEntity | DictionaryEntity;
}
