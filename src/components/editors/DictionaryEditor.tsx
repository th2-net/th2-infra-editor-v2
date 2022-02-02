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
import ConfigEditor from './ConfigEditor';
import { usePrevious } from '../../hooks/usePrevious';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';
import { DictionaryEntity } from '../../models/Dictionary';
import { downloadFile, isXMLValid } from '../../helpers/files';
import { visuallyHidden } from '../../styles/mixins';
import Icon from '../Icon';

const useStyle = createUseStyles({
	container: {
		backgroundColor: '#FFF',
		border: 'none',
		borderRadius: 24,
		boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.16)',
		padding: 16,
		width: '100%',
		height: '100%',
		display: 'grid',
		gridTemplateRows: 'auto 1fr auto',
		gap: 24,
	},
	header: {
		fontSize: 16,
		fontWeight: 700,
	},
	controls: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},

	button: {
		display: 'flex',
		gap: 14,
		height: '40px',
		width: 'fit-content',
		borderRadius: '4px',
		color: '#fff',
		padding: '12px 24px',
		textTransform: 'capitalize',
		outline: 'none',
		border: 'none',
		fontWeight: '500',
		fontSize: '14px',
		position: 'relative',
		cursor: 'pointer',
		backgroundColor: '#0099E5',
		'&:hover': {
			backgroundColor: '#EEF2F6',
			color: 'rgba(51, 51, 51, 0.8)',
		},
		'&:active': {
			backgroundColor: '#0099E5',
		},
		'&:disabled': {
			opacity: '0.4',
		},
	},
	buttonSecondary: {
		padding: '12px 24px',
		backgroundColor: 'rgba(51, 51, 51, 0.6)',
	},
	input: {
		...visuallyHidden(),
	},
});

interface DictionaryEditorProps {
	editDictionary: (v: string) => void;
	dictionary: DictionaryEntity;
}

const DictionaryEditor = ({ editDictionary, dictionary }: DictionaryEditorProps) => {
	const classes = useStyle();

	const dictionaryInputConfig = useInput({
		initialValue: dictionary?.spec.data,
		id: 'dictionary-editor',
		label: dictionary?.name,
		validate: value => isXMLValid(value),
	});

	const prevValue = usePrevious(dictionaryInputConfig.value);

	const uploadDictionary = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const file = e.target.files[0];
			const data = await file.text();
			dictionaryInputConfig.setValue(data);
		}
	};

	const downloadDictionary = () => {
		if (dictionary) {
			downloadFile(dictionaryInputConfig.value, dictionary.name, 'text/xml');
		}
	};

	return (
		<div className={classes.container}>
			<div className={classes.header}>Dictionary Editor</div>

			<ConfigEditor configInput={dictionaryInputConfig} />
			<div className={classes.controls}>
				<button
					className={classes.button}
					disabled={prevValue === dictionaryInputConfig.value || !dictionaryInputConfig.isValid}
					onClick={() => {
						if (dictionaryInputConfig.isValid) {
							editDictionary(dictionaryInputConfig.value);
						}
					}}>
					Apply changes
				</button>
				<div style={{ display: 'flex', gap: 19 }}>
					<label
						className={classNames(classes.button, classes.buttonSecondary)}
						htmlFor='dictionary-file-input'
						title='Upload'>
						<Icon id='upload' stroke='#FFF' fill='#FFF' />
						Upload
					</label>
					<input
						onChange={uploadDictionary}
						type='file'
						accept='.xml'
						className={classes.input}
						id='dictionary-file-input'
					/>
					<button
						onClick={downloadDictionary}
						className={classNames(classes.button, classes.buttonSecondary)}
						title='Download'>
						<Icon id='downloadDictionary' stroke='#FFF' fill='#FFF' />
						Download
					</button>
				</div>
			</div>
		</div>
	);
};

export default DictionaryEditor;
