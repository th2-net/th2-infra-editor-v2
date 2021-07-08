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

import { useInput } from '../../hooks/useInput';
import { createUseStyles } from 'react-jss';
import Icon from '../Icon';
import ConfigEditor from './ConfigEditor';
import { DictionaryEntity } from '../../models/Dictionary';
import { downloadFile, isXMLValid } from '../../helpers/files';
import { buttonReset, visuallyHidden } from '../../styles/mixins';
import Input from '../utils/Input';

interface DictionaryEditorProps {
	dictionary: DictionaryEntity | null;
	setConfigValue?: (v: string) => void;
	setNameValue?: (v: string) => void;
	apply: () => void;
}

const useStyle = createUseStyles({
	controls: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center'
	},
	applyChanges: {
		...buttonReset(),
		'&:disabled': {
			backgroundColor: 'gray',
			cursor: 'not-allowed'
		}
	},
	download: {
		...buttonReset(),
		display: 'inline-flex',
		marginLeft: 10,
	},
	upload: {
		display: 'inline-flex',
		marginLeft: 10,
		cursor: 'pointer',
		transform: 'rotate(180deg)'
	},
	input: {
		...visuallyHidden()
	}
})

const DictionaryEditor = ({ dictionary, setConfigValue, setNameValue, apply }: DictionaryEditorProps) => {

	const classes = useStyle();

	const dictionaryInputName = useInput({
		setInitialValue: setNameValue,
		initialValue: dictionary?.name,
		id: 'dictionary-name',
		label: 'Name',
		validate: (v: string) => !!v
	})

	const dictionaryInputConfig = useInput({
		initialValue: dictionary?.spec.data,
		id: 'dictionary-config',
		label: 'Config',
		validate: (v: string) => isXMLValid(v)
	});

	
	const uploadDictionary = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const file = e.target.files[0];
			const data = await file.text();
			dictionaryInputConfig.setValue(data);
		}
	}

	const downloadDictionary = () => {
		if (dictionary) {
			downloadFile(dictionaryInputConfig.value, dictionary.name, 'text/xml');
		}
	}

	return (
		<>
			<Input inputConfig={dictionaryInputName}
			/>
			<ConfigEditor 
				configInput={
					setConfigValue 
						? {...dictionaryInputConfig, setValue: setConfigValue}
						: dictionaryInputConfig
				}
			/>
			<div className={classes.controls}>
				<button
					className={classes.applyChanges}
					disabled={!dictionaryInputConfig.isValid || !dictionaryInputName.isValid}
					onClick={apply}
				>
					Apply
				</button>
				<label className={classes.upload} htmlFor='dictionary-file-input' title='Upload'>
					<Icon id='download' fill='black'/>
				</label>
				<input
					onChange={uploadDictionary}
					type='file'
					accept='.xml'
					className={classes.input}
					id='dictionary-file-input'
				/>
				<button onClick={downloadDictionary} className={classes.download} title='Download'>
					<Icon id='download' fill='black'/>
				</button>
			</div>
		</>
	);
};

export default DictionaryEditor;
 