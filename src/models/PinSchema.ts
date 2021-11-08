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
 * limitations under the License.
 ***************************************************************************** */
export const pinSchema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			name: { type: 'string' },
			['connection-type']: { enum: ['mq', 'grpc'] },
			filters: {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						metadata: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									['field-name']: { type: 'string' },
									['expected-value']: { type: 'string' },
									['operation']: { type: 'string' },
								},
								additionalProperties: false,
								required: ['field-name', 'expected-value', 'operation'],
							},
						},
					},
					additionalProperties: false,
					required: ['metadata'],
				},
			},
			attributes: {
				type: 'array',
				items: {
					type: 'string',
				},
			},
		},
		additionalProperties: false,
		required: ['name', 'connection-type'],
	},
};
