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
import { createUseStyles } from 'react-jss';
import { useAppViewStore } from '../../hooks/useAppViewStore';
import { useBoxesStore } from '../../hooks/useBoxesStore';
import { useBoxUpdater } from '../../hooks/useBoxUpdater';
import { useInput } from '../../hooks/useInput';
import { BoxEntity } from '../../models/Box';
import { button } from '../../styles/mixins';
import AppViewType from '../../util/AppViewType';
import Input from '../util/Input';

const useStyles = createUseStyles({
	boxCreationLayout: {
		width: '50%',
		minWidth: '300px',
		display: 'flex',
		flexDirection: 'column',
		gap: '20px',
	},
	inputGroup: {
		display: 'contents',
	},
	submitButton: {
		...button(),
		alignSelf: 'end',
	},
	title: {
		margin: '5px 0 0 0',
	},
});

const BoxCreationLayout = () => {
	const viewStore = useAppViewStore();
	const boxesStore = useBoxesStore();
	const boxUpdater = useBoxUpdater();

	const classes = useStyles();

	const name = useInput({
		id: 'box-name',
		name: 'box-name',
		label: 'Name',
		validate: name =>
			/^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/gm.test(name),
	});

	const type = useInput({
		id: 'box-type',
		name: 'box-type',
		label: 'Type',
		autocomplete: {
			variants: boxesStore.types,
			datalistKey: 'create-box-modal__box-type',
		},
	});

	const imageName = useInput({
		id: 'boxImageName',
		name: 'boxImageName',
		label: 'Image name',
	});

	const imageVersion = useInput({
		id: 'boxImageVersion',
		name: 'boxImageVersion',
		label: 'Image version',
	});

	const nodePort = useInput({
		label: 'Node port',
		id: 'nodePort',
		name: 'nodePort',
		validate: (value: string) =>
			value.trim().length > 0 ? /^\d+$/.test(value) && parseInt(value) <= 65535 : true,
		required: false,
	});

	const inputs = [name, type, imageName, imageVersion, nodePort];

	const createNewBox = () => {
		if (inputs.every(inputConfig => inputConfig.isValid)) {
			const inputValues = inputs.map(inputConfig => inputConfig.value.trim());
			const [name, type, imageName, imageVersion, nodePortString] = inputValues;
			let nodePort = parseInt(nodePortString) || null;

			const spec: BoxEntity['spec'] = {
				pins: {},
				imageName: imageName,
				imageVersion: imageVersion,
				type,
				extendedSettings: {
					service: {
						enabled: false,
					},
				},
				...(nodePort
					? {
							'node-port': nodePort,
					  }
					: {}),
			};

			const box = {
				name,
				kind: 'Th2Box',
				spec,
			};

			boxUpdater.createBox(box);
			boxesStore.selectBox(box);
			viewStore.setViewType(AppViewType.BoxView);
		} else {
			alert('Invalid box info');
		}
	};

	return (
		<div className={classes.boxCreationLayout}>
			<h4 className={classes.title}>New box</h4>
			<div className={classes.inputGroup}>
				{inputs.map(inputConfig => (
					<Input key={inputConfig.label} inputConfig={inputConfig} />
				))}
			</div>
			<button
				disabled={inputs.some(input => !input.isValid)}
				className={classes.submitButton}
				onClick={createNewBox}>
				Create
			</button>
		</div>
	);
};

export default observer(BoxCreationLayout);
