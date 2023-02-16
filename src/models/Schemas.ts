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

export type schemaTemplate = {
	path: string;
	uri: string;
	schema: any;
};

const _pinSchema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			name: { type: 'string' },
			connectionType: { enum: ['mq', 'grpc'] },
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
									fieldName: { type: 'string' },
									expectedValue: { type: 'string' },
									operation: { type: 'string' },
								},
								additionalProperties: false,
								required: ['fieldName', 'expectedValue', 'operation'],
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
		required: ['name', 'connectionType'],
	},
};

const _extenedSettingsSchema = {
	type: 'object',
	properties: {
		service: {
			type: 'object',
			properties: {
				enabled: { type: 'boolean' },
				type: { type: 'string' },
				endpoints: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							name: { type: 'string' },
							targetPort: { type: 'number' },
							nodePort: { type: 'number' },
						},
						additionalProperties: false,
						required: ['name', 'targetPort', 'nodePort'],
					},
				},
				ingress: {
					type: 'object',
					properties: {
						urlPathes: {
							type: 'array',
							items: {
								type: 'string',
							},
						},
					},
					additionalProperties: false,
					required: ['urlPathes'],
				},
			},
			additionalProperties: false,
			required: ['enabled', 'type', 'endpoints', 'ingress'],
		},
		envVariables: {
			type: 'object',
			properties: {
				JAVA_TOOL_OPTIONS: {
					type: 'string',
				},
			},
			additionalProperties: false,
			required: ['JAVA_TOOL_OPTIONS'],
		},
		resources: {
			type: 'object',
			properties: {
				limits: {
					type: 'object',
					properties: {
						memory: { type: 'string' },
						cpu: { type: 'string' },
					},
					additionalProperties: false,
					required: ['cpu', 'memory'],
				},
				requests: {
					type: 'object',
					properties: {
						memory: { type: 'string' },
						cpu: { type: 'string' },
					},
					additionalProperties: false,
					required: ['cpu', 'memory'],
				},
			},
			additionalProperties: false,
			required: ['limits', 'requests'],
		},
	},
	additionalProperties: false,
	required: ['service', 'envVariables', 'resources'],
};

const getSchemaURI = (schema: any): string => {
	const blob = new Blob([JSON.stringify(schema)], { type: 'application/json' });
	return URL.createObjectURL(blob).substring(5);
};

export const extenedSchema: schemaTemplate = {
	path: 'a://b/extended_settings_schema.json',
	uri: getSchemaURI(_extenedSettingsSchema),
	schema: _extenedSettingsSchema,
};

export const pinSchema: schemaTemplate = {
	path: 'a://b/pinschema.json',
	uri: getSchemaURI(_pinSchema),
	schema: _pinSchema,
};
