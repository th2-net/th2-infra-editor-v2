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

import { RequestModel } from '../models/FileBase';
import Schema from '../models/Schema';
import ApiSchema from './ApiSchema';

export default class Api implements ApiSchema {
	async fetchSchemasList(): Promise<string[]> {
		const res = await fetch('backend/schemas');

		if (!res.ok) {
			console.error(`Can't fetch schemas list - ${res.statusText}`);
			return [];
		}

		return res.json();
	}

	async fetchSchemaState(schemaName: string, abortSignal?: AbortSignal): Promise<Schema> {
		const res = await fetch(`backend/schema/${schemaName}`, { signal: abortSignal });

		if (!res.ok) {
			console.error(`Can't fetch schema state - ${res.statusText}`);
			return {} as Schema;
		}

		return res.json();
	}

	async createSchema(schemaName: string): Promise<Schema> {
		const res = await fetch(`backend/schema/${schemaName}`, {
			method: 'PUT',
		});

		if (res.ok) {
			return res.json();
		}

		console.error(res);
		return {} as Schema;
	}

	async sendSchemaRequest(schemaName: string, schema: RequestModel[]): Promise<boolean> {
		const res = await fetch(`backend/schema/${schemaName}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(schema),
		});

		if (!res.ok) {
			console.error(res);
		}

		return res.ok;
	}

	subscribeOnChanges(schemaName: string): EventSource {
		return new EventSource(`backend/subscriptions/schema/${schemaName}`);
	}
}
