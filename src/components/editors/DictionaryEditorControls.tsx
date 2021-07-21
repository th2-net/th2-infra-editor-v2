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

import { downloadFile } from '../../helpers/files';
import { observer } from 'mobx-react-lite';
import { createUseStyles } from 'react-jss';
import Icon from '../Icon';
import { DictionarySpecs } from '../../models/Dictionary'
import { buttonReset, visuallyHidden } from '../../styles/mixins';
import { useEntityEditor } from '../../hooks/useEntityEditor';

const useStyle = createUseStyles({
	controls: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center'
	},
	applyChanges: {
		...buttonReset(),
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

const DictionaryEditorControls = () => {
	const classes = useStyle();
	const { entity, setEntitySpecProperty, apply } = useEntityEditor();

	const uploadDictionary = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const file = e.target.files[0];
			const data = await file.text();
			setEntitySpecProperty('data', data);
		}
	}

	const downloadDictionary = () => {
		if (entity) {
			downloadFile((entity.spec as DictionarySpecs).data, entity.name, 'text/xml');
		}
	}

	return (
		<>
			<div className={classes.controls}>
				<button
					className={classes.applyChanges}
					onClick={apply}
				>
					Apply changes
				</button>
				<label 
					className={classes.upload} 
					htmlFor='dictionary-file-input'
					title='Upload'
				>
					<Icon id='download' fill='black'/>
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
					className={classes.download}
					title='Download'
				>
					<Icon id='download' fill='black'/>
				</button>
			</div>
		</>
	)
};

export default observer(DictionaryEditorControls);
 