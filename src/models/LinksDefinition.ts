/** *****************************************************************************
 *  Copyright 2009-2020 Exactpro (Exactpro Systems Limited)
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ***************************************************************************** */

import FileBase from './FileBase';
import { ConnectionCoord, ConnectionOwner, ExtendedConnectionOwner } from './Box';
import { DictionaryRelation } from './Dictionary';

export interface LinksDefinition extends FileBase {
	spec: {
		['boxes-relation']?: {
			['router-mq']: Link<ConnectionOwner>[];
			['router-grpc']: Link<ConnectionOwner>[];
		};
		['dictionaries-relation']?: DictionaryRelation[];
		['multi-dictionaries-relation']?: DictionaryRelation[];
	};
}

export interface Link<T extends ConnectionOwner | ExtendedConnectionOwner> {
	name: string;
	from?: T;
	to?: T;
}

export interface LinkArrow {
	name: string;
	start: ConnectionCoord;
	end: ConnectionCoord;
	isHighlighted: boolean;
	isHidden: boolean;
}

export function isBoxLinksDefinition(file: FileBase): file is LinksDefinition {
	return file.kind === 'Th2Link' && (file as LinksDefinition).spec['boxes-relation'] !== undefined;
}

export function isLink(object: unknown): object is Link<ConnectionOwner | ExtendedConnectionOwner> {
	return (
		typeof object === 'object' &&
		object !== null &&
		(object as Link<ConnectionOwner | ExtendedConnectionOwner>).to !== undefined &&
		(object as Link<ConnectionOwner | ExtendedConnectionOwner>).from !== undefined
	);
}

export type ConnectionDirection = 'to' | 'from';
