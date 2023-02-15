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

export interface BoxEntity extends FileBase {
	spec: {
		['customConfig']?: {
			[prop: string]: string;
		};
		['mqRouter']?: {
			[prop: string]: string;
		};
		['grpcRouter']?: {
			[prop: string]: string;
		};
		['extendedSettings']: {
			['chartCfg']?: {
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
		['imageName']: string;
		['imageVersion']: string;
		['versionRange']?: string;
		['bookName']?: string;
		pins?: Pins;
		disabled?: boolean;
		type: string;
	};
}

export interface Pins {
	mq?: {
		subscribers?: Array<Pin>;
		publishers?: Array<Pin>;
	};
	grpc?: {
		server?: Array<Pin>;
		client?: Array<Pin>;
	};
}

export interface Pin {
	name: string;
	attributes?: Array<string>;
	filters?: Array<Filter>;
}

export interface Filter {
	metadata: {
		['fieldName']: string;
		['expectedValue']: string;
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
	['serviceClass']?: string;
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
	return typeof object === 'object' && object !== null && (object as Pin).name !== undefined;
}

export function getPins(pins?: Pins, connectionType?: 'mq' | 'grpc'): Pin[] {
	let result: Pin[] = [];

	if (pins) {
		if (connectionType === 'mq') {
			result = [...(pins.mq?.publishers || []), ...(pins.mq?.subscribers || [])];
		} else if (connectionType === 'grpc') {
			result = [...(pins.grpc?.client || []), ...(pins.grpc?.server || [])];
		} else {
			result = [
				...(pins.mq?.publishers || []),
				...(pins.mq?.subscribers || []),
				...(pins.grpc?.client || []),
				...(pins.grpc?.server || []),
			];
		}
	}

	return result;
}

export function getPinConnectionType(pin?: Pin, pins?: Pins): 'mq' | 'grpc' {
	const mqPins = getPins(pins, 'mq');
	const grpcPins = getPins(pins, 'grpc');

	if (mqPins.length > 0 && pin && mqPins.some(mqPin => mqPin.name === pin.name)) {
		return 'mq';
	}

	if (grpcPins.length > 0 && pin && grpcPins.some(grpcPin => grpcPin.name === pin.name)) {
		return 'grpc';
	}

	return 'mq';
}

export enum BoxStatus {
	FAILED = 'Failed',
	RUNNING = 'Running',
	PENDING = 'Pending',
}
