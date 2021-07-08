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

import Editor from '@monaco-editor/react';
import { InputConfig } from '../../hooks/useInput';
import { defineFileFormat } from '../../helpers/files';
import { createUseStyles } from 'react-jss';
import { scrollBar } from '../../styles/mixins';

interface ConfigEditorProps {
	configInput: InputConfig;
}

const useStyle = createUseStyles({
	textarea: {
		...scrollBar(),
		width: '100%',
		backgroundColor: '#fff',
		border: (props: InputConfig) =>  props.isValid ? '1px solid #7a99b8' : '2px solid red',
		borderRadius: 4,
		height: '100%',
		resize: 'none',
		padding: 0,
		fontSize: 13,
		lineHeight: 14,
		outlineColor: (props: InputConfig) => props.isValid ? 'green' : 'none',
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

const ConfigEditor = ({ configInput }: ConfigEditorProps) => {
	const classes = useStyle(configInput)

	return (
		<div className={classes.textarea_wrapper}>
			<label htmlFor={configInput.bind.name} className={classes.textarea_label}>
				{configInput.label}
			</label>
			<Editor
				height={400}
				width='auto'
				language={defineFileFormat(configInput.value)}
				value={configInput.value}
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
				onChange={value => value && configInput.setValue(value)}
			/>
		</div>
	);
};

export default ConfigEditor;
