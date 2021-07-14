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
import { observer } from 'mobx-react-lite';
import { defineFileFormat } from '../../helpers/files'
import Editor, { EditorProps } from '@monaco-editor/react';
import { useEntityEditor } from '../../hooks/useEntityEditor';
import { OtherSpecs } from '../../models/FileBase';
import { BoxSpecs } from '../../models/Box';
import { DictionarySpecs } from '../../models/Dictionary';

const UnionEditor = () => {

	const { entity, setEntityName, setEntitySpecProperty } = useEntityEditor();
	
	if (!entity) {
		return null;
	}
	
	return (
		<div>
			<div>
				<label htmlFor='name'>
					Name
				</label>
				<input
					id='name'
					type='text'
					autoComplete='off'
					value={entity.name}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
						setEntityName(event.target.value)
					}}
				/>
			</div>
			{
				entity.spec && Object.entries(entity.spec as (OtherSpecs | BoxSpecs | DictionarySpecs))
					.map(([key, value]) => {
						const prop = key as keyof (OtherSpecs | BoxSpecs | DictionarySpecs);
						const commonEditorProps: EditorProps = {
							height: 300,
							width: 'auto',
							language: defineFileFormat(value),
							onChange: (v) => setEntitySpecProperty(prop, v),
							options: {
								fontSize: 12,
								codeLens: false,
								lineNumbers: 'off',
								minimap: {
									enabled: false,
								},
								padding: {
									bottom: 0,
									top: 0,
								},
								autoClosingBrackets: 'always',
								autoClosingQuotes: 'always',
								contextmenu: false,
							}
						}
						if (key === 'data') {	
							return (
								<Editor 
								value={value}
								{...commonEditorProps}
							/>
							)
						}
						if (
							key === 'custom-config' ||
							key === 'extended-settings' ||
						  key === 'pins'
						) {
							return (
								<Editor 
									value={JSON.stringify(value, null, 4)}
									{...commonEditorProps}
								/>
							)
						}
						return (
							<div>
								<label htmlFor={key}>
									{key}
								</label>
								<input
									id={key}
									type='text'
									autoComplete='off'
									defaultValue={value}
									onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
										setEntitySpecProperty(prop, event.target.value)
									}}
								/>
							</div>
						)
					})
			}
		</div>
	);
};

export default observer(UnionEditor);
