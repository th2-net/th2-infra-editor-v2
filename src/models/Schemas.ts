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

const _filterProps = {
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
};

const _filtersSchema = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			metadata: _filterProps,
			message: _filterProps,
			properties: _filterProps,
		},
		additionalProperties: false,
	},
};

const _pinSchema = {
	type: 'object',
	properties: {
		mq: {
			type: 'object',
			properties: {
				subscribers: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							name: { type: 'string' },
							attributes: {
								type: 'array',
								items: {
									type: 'string',
								},
							},
							settings: {
								type: 'object',
								properties: {
									storageOnDemand: { type: 'boolean' },
									overloadStrategy: { type: 'string' },
									queueLength: { type: 'string' },
								},
								additionalProperties: false,
							},
							linkTo: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										box: { type: 'string' },
										pin: { type: 'string' },
										additionalProperties: false,
										required: ['box', 'pin'],
									},
								},
							},
							filters: _filtersSchema,
							additionalProperties: false,
							required: ['name'],
						},
					},
				},
				publishers: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							name: { type: 'string' },
							attributes: {
								type: 'array',
								items: {
									type: 'string',
								},
							},
							filters: _filtersSchema,
							additionalProperties: false,
							required: ['name'],
						},
					},
				},
			},
		},
		grpc: {
			type: 'object',
			properties: {
				server: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							name: { type: 'string' },
							serviceClasses: {
								type: 'array',
								items: {
									type: 'string',
								},
							},
							additionalProperties: false,
							required: ['name'],
						},
					},
				},
				client: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							name: { type: 'string' },
							serviceClass: { type: 'string' },
							strategy: { type: 'string' },
							linkTo: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										box: { type: 'string' },
										pin: { type: 'string' },
										additionalProperties: false,
										required: ['box', 'pin'],
									},
								},
							},
							attributes: {
								type: 'array',
								items: {
									type: 'string',
								},
							},
							filters: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										properties: _filterProps,
									},
									additionalProperties: false,
								},
							},
							additionalProperties: false,
							required: ['name'],
						},
					},
				},
				additionalProperties: false,
			},
		},
		additionalProperties: false,
	},
};

const _extenedSettingsSchema = {
	type: 'object',
	properties: {
		nodeName: { type: 'string' },
		sharedMemory: {
			type: 'object',
			properties: {
				enabled: { type: 'boolean' },
			},
			additionalProperties: false,
			required: ['enabled'],
		},
		replicas: { type: 'string' },
		k8sProbes: { type: 'boolean' },
		service: {
			type: 'object',
			properties: {
				enabled: { type: 'boolean' },
				nodePort: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							name: { type: 'string' },
							exposedPort: { type: 'number' },
							containerPort: { type: 'number' },
						},
						additionalProperties: false,
						required: ['name', 'exposedPort'],
					},
				},
				clusterIP: {
					type: 'array',
					items: {
						type: 'object',
						properties: { name: { type: 'string' }, containerPort: { type: 'number' } },
						additionalProperties: false,
						required: ['name'],
					},
				},
				ingress: {
					type: 'object',
					properties: {
						urlPaths: {
							type: 'array',
							items: {
								type: 'string',
							},
						},
					},
				},
			},
			additionalProperties: false,
			required: ['enabled'],
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
				},
				requests: {
					type: 'object',
					properties: {
						memory: { type: 'string' },
						cpu: { type: 'string' },
					},
					additionalProperties: false,
				},
			},
			additionalProperties: false,
		},
		externalBox: {
			type: 'object',
			properties: {
				enabled: { type: 'boolean' },
				address: { type: 'string' },
				endpoints: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							name: { type: 'string' },
							targetPort: { type: 'string' },
							port: { type: 'string' },
						},
						additionalProperties: false,
						required: ['name', 'targetPort'],
					},
				},
			},
			additionalProperties: false,
		},
		hostAliases: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					ip: { type: 'boolean' },
					hostnames: { type: 'array', items: { type: 'string' } },
				},
				additionalProperties: false,
			},
		},
		hostNetwork: { type: 'boolean' },
		mounting: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					path: { type: 'string' },
					pvcName: { type: 'string' },
				},
				additionalProperties: false,
			},
		},
	},
	additionalProperties: false,
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
