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
import Editor from '@monaco-editor/react';
import { useEntityEditor } from '../../hooks/useEntityEditor';
import { OtherSpecs } from '../../models/FileBase';
import { BoxSpecs } from '../../models/Box';
import { DictionarySpecs } from '../../models/Dictionary';
import { createUseStyles } from 'react-jss';
import { scrollBar } from '../../styles/mixins';

interface CommonEditorProps {
	isNewEntity?: boolean
}

const CommonEditor = ({isNewEntity = false}: CommonEditorProps) => {

	const { entity, setEntityName, setEntitySpecProperty } = useEntityEditor();
	
	if (!entity) {
		return null;
	}
	
	return (
		<div>
			{isNewEntity ? <Input
				id='name'
				label='Name'
				value={entity.name}
				onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
					setEntityName(event.target.value)
				}}
			/> : <h4>{entity.name}</h4>}
			{
				entity.spec && Object.entries(entity.spec as (OtherSpecs | BoxSpecs | DictionarySpecs))
					.map(([key, value]) => {
						const prop = key as keyof (OtherSpecs | BoxSpecs | DictionarySpecs);
						const label = `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
						const commonEditorProps = {
							onChange: (v?: string) => setEntitySpecProperty(prop, v as string),
							id: key,
							label
						}
						if (key === 'data') {	
							return (
								<ConfigEditor
									key={key}
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
								<ConfigEditor
									key={key}
									value={JSON.stringify(value, null, 4)}
									{...commonEditorProps}
								/>
							)
						}
						return (
							<Input
								key={key}
								id={key}
								label={`${key.charAt(0).toUpperCase()}${key.slice(1)}`}
								value={value}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									setEntitySpecProperty(prop, event.target.value)
								}}
							/>
						)
					})
			}
		</div>
	);
};

export default observer(CommonEditor);

const useInputStyles = createUseStyles(
	{
		container: {
			display: 'flex',
			flexDirection: 'column',
		},
		input: {
			width: '100%',
      		height: 21,
			backgroundColor: '#fff',
			border: '1px solid #7a99b8',
			borderRadius: 4,
			padding: '0 10px',
			fontSize: 13,
			lineHeight: '14px',
			outlineColor: 'green',
		},
		label: {
			fontSize: 12,
			lineHeight: '14px',
			marginBottom: '6px',
		},
		invalid: {
			outline: 'none',
			border: '2px solid red',
		},
	},
	{ name: 'Input' },
);

interface InputProps {
	id: string;
	label: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	value: string;
	autocomplete?: {
		datalistKey: string;
		variants: string[];
	}
}

function Input({ label, autocomplete, ...rest }: InputProps) {
	const classes = useInputStyles();

	return (
		<div className={classes.container}>
			<label htmlFor={rest.id} className={classes.label}>
				{label}
			</label>
			<input
				{...rest}
				type='text'
				className={classes.input}
				list={autocomplete?.datalistKey}
				autoComplete='off'
			/>
			{autocomplete && rest.value.length > 0 && (
				<datalist id={autocomplete.datalistKey}>
					{autocomplete.variants.map((variant, index) => (
						<option key={index} value={variant} />
					))}
				</datalist>
			)}
		</div>
	);
};

const useEditorStyle = createUseStyles({
	textarea: {
		...scrollBar(),
		width: '100%',
		backgroundColor: '#fff',
		borderRadius: 4,
		height: '100%',
		resize: 'none',
		padding: 0,
		fontSize: 13,
		lineHeight: 14,
		color: '#333333',
	},
	textarea_wrapper: {
		display: 'flex',
		flexDirection: 'column',
		marginBottom: 10,
	},
	textarea_label: {
		color: '#666666',
		fontSize: 11,
		margin: '6px 0',
	}
})

interface ConfigEditorProps {
	id: string;
	value: string;
	label: string;
	onChange: (v?: string) => void;
}

function ConfigEditor ({label, value, id, onChange}: ConfigEditorProps) {
	const classes = useEditorStyle();

	return (
		<div className={classes.textarea_wrapper}>
			<label htmlFor={id} className={classes.textarea_label}>
				{label}
			</label>
			<Editor
				height={300}
				width='auto'
				language={defineFileFormat(value)}
				value={value}
				options={{
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
				}}
				className={classes.textarea}
				onChange={onChange}
			/>
		</div>
	);
};
