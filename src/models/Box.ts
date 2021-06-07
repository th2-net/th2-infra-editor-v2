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

import FileBase from './FileBase';
import { DictionaryRelation } from './Dictionary';

export interface BoxEntity extends FileBase {
	spec: {
		['custom-config']?: {
			[prop: string]: string;
		};
		['extended-settings']: {
			['chart-cfg']?: {
				path: string;
				ref: string;
			};
			resources?: {
				limits: {
					cpu: string;
					memory: string;
				};
				requests: {
					cpu: string;
					memory: string;
				};
			};
			service: {
				enabled: boolean;
				targetPort?: string;
			};
		};
		['image-name']: string;
		['image-version']: string;
		['node-port']?: number;
		['dictionaries-relation']?: Array<DictionaryRelation>;
		data?: string;
		pins?: Array<Pin>;
		type: string;
	};
}

export interface Pin {
	attributes?: Array<string>;
	['connection-type']: 'mq' | 'grpc';
	filters?: Array<Filter>;
	name: string;
}

export interface Filter {
	metadata: {
		['field-name']: string;
		['expected-value']: string;
		['operation']: string;
	}[];
}

export interface Connection {
	name: string;
	coords: ConnectionPoints;
}

export interface ConnectionPoints {
	leftPoint: ConnectionCoord;
	rightPoint: ConnectionCoord;
}

export interface ConnectionCoord {
	left: number;
	top: number;
}

export interface ConnectionOwner {
	box: string;
	pin: string;
	strategy?: string;
	['service-class']?: string;
}

export interface ExtendedConnectionOwner extends ConnectionOwner {
	connectionType: 'mq' | 'grpc';
}

export function isBoxEntity(object: unknown): object is BoxEntity {
	return (
		typeof object === 'object' &&
		object !== null &&
		((object as BoxEntity).kind === 'Th2Box' ||
			(object as BoxEntity).kind === 'Th2CoreBox' ||
			(object as BoxEntity).kind === 'Th2Estore' ||
			(object as BoxEntity).kind === 'Th2Mstore')
	);
}

export function isPin(object: unknown): object is Pin {
	return (
		typeof object === 'object' &&
		object !== null &&
		(object as Pin)['connection-type'] !== undefined
	);
}
