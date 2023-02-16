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
 *  limitations under the License.
 ***************************************************************************** */

import { RequestModel } from '../models/FileBase';
import { Schema } from '../models/Schema';

interface Link {
	linkName: string;
	message: string;
	from: string;
	to: string;
}

export interface SchemaRequest {
	commitRef: null | string;
	resources: null | Array<Object>;
	validationErrors: null | {
		linkErrorMessages: {
			codecLinks: Array<Link>;
			dictionaryLinks: Array<Link>;
			editorGeneratedLinks: Array<Link>;
			linksLive: Array<Link>;
		};
		boxResourceErrorMessages: Array<{
			box: string;
			message: string;
		}>;
		exceptionMessages: Array<string>;
	};
}

export default interface ApiSchema {
	fetchSchemasList: () => Promise<string[]>;
	fetchSchemaState: (schemaName: string, abortSignal?: AbortSignal) => Promise<Schema>;
	createSchema: (schemaName: string) => Promise<Schema>;
	sendSchemaRequest: (schemaName: string, schema: RequestModel[]) => Promise<SchemaRequest>;
	subscribeOnChanges: (schemaName: string) => EventSource;
}
