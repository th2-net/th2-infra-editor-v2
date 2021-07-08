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
import { useInput } from '../../hooks/useInput';
import { useNewEntityStore } from '../../hooks/useNewEntityStore';
import { createUseStyles } from 'react-jss';
import { buttonReset } from '../../styles/mixins';
import Input from '../utils/Input';

const useStyle = createUseStyles({
	applyChanges: {
		...buttonReset(),
		'&:disabled': {
			backgroundColor: 'gray',
			cursor: 'not-allowed'
		}
	},
})

const NewBoxEditor = () => {

	const {
		newBox,
		boxTypes,
		boxNames,
		setNewBoxName,
		setNewBoxImageName,
		setNewBoxImageVersion,
		setNewBoxType,
		setNewBoxNodePort,
		addNewBox
	} = useNewEntityStore();

	const nameInput = useInput({
		id: 'name',
		label: 'Name',
		initialValue: newBox.name,
		setInitialValue: setNewBoxName,
		validate: name =>
			name.trim().length > 0 &&
			/^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/gm.test(name) &&
			!boxNames.includes(name),
	})

	const imageNameInput = useInput({
		id: 'imageName',
		label: 'Image Name',
		initialValue: newBox.spec['image-name'],
		setInitialValue: setNewBoxImageName,
		validate: imageName => imageName.trim().length > 0
	})

	const imageVersionInput = useInput({
		id: 'imageVersion',
		label: 'Image Version',
		initialValue: newBox.spec['image-version'],
		setInitialValue: setNewBoxImageVersion,
		validate: imageVersion => imageVersion.trim().length > 0
	})

	const typeInput = useInput({
		id: 'type',
		label: 'Type',
		initialValue: newBox.spec.type,
		setInitialValue: setNewBoxType,
		autocomplete: {
			variants: boxTypes,
			datalistKey: 'types'
		}
	})

	const nodePortInput = useInput({
		id: 'nodePort',
		label: 'Node Port',
		initialValue: newBox.spec['node-port'] ? `${newBox.spec['node-port']}` : '',
		setInitialValue: setNewBoxNodePort,
		validate: (value: string) =>
			value.trim().length > 0 ? /^\d+$/.test(value) && parseInt(value) <= 65535 : true
	})

	const classes = useStyle();

	return (
		<div>
			<Input inputConfig={nameInput}/>
			<Input inputConfig={typeInput}/>
			<Input inputConfig={imageNameInput}/>
			<Input inputConfig={imageVersionInput}/>
			<Input inputConfig={nodePortInput}/>
			<button
				className={classes.applyChanges}
				disabled={
					!nameInput.isValid ||
					!typeInput.isValid ||
					!imageNameInput.isValid ||
					!imageVersionInput.isValid ||
					!nodePortInput.isValid
				}
				onClick={addNewBox}
			>
				Apply
			</button>
		</div>
	);
};

export default observer(NewBoxEditor);
