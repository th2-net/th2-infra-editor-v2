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

import { isObservable, toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { createUseStyles } from 'react-jss';
import { isValidJSONArray, isValidJSONObject } from '../../helpers/files';
import { useInput } from '../../hooks/useInput';
import { useBoxesStore } from '../../hooks/useBoxesStore';
import { scrollBar } from '../../styles/mixins';
import { Theme } from '../../styles/theme';
import ConfigEditor from './ConfigEditor';
import Input from '../util/Input';
import { BoxEntity } from '../../models/Box';
import { cloneDeep } from 'lodash';
import { useBoxUpdater } from '../../hooks/useBoxUpdater';
import { extenedSchema, pinSchema } from '../../models/Schemas';

const useStyles = createUseStyles((t: Theme) => ({
	container: {
		border: '1px solid',
		borderRadius: 6,
		padding: '15px 10px',
		...scrollBar(),
	},

	inputGroup: {
		display: 'grid',
		gridTemplateColumns: 'repeat(2, 1fr)',
		gap: '10px',
		marginBottom: 10,
	},
	codeEditorLabel: {
		fontSize: 12,
		margin: '6px 0',
		fontWeight: 'normal',
	},
}));

function Config() {
	const classes = useStyles();

	const { selectedBox, isSelectedBoxValid } = useBoxesStore();
	const boxUpdater = useBoxUpdater();

	const customConfig = useInput({
		initialValue: selectedBox?.spec['custom-config']
			? JSON.stringify(selectedBox?.spec['custom-config'], null, 4)
			: '',
		id: 'custom-config',
	});

	const pinsConfig = useInput({
		initialValue: selectedBox?.spec.pins ? JSON.stringify(selectedBox.spec.pins, null, 4) : '',
		id: 'custom-config',
	});

	const extendedSettings = useInput({
		initialValue: selectedBox?.spec['extended-settings']
			? JSON.stringify(selectedBox.spec['extended-settings'], null, 4)
			: '',
		id: 'extended-settings',
	});

	const imageName = useInput({
		initialValue: selectedBox?.spec['image-name'] || '',
		id: 'imageName',
		label: 'Image name',
	});

	const imageVersion = useInput({
		initialValue: selectedBox?.spec['image-version'] || '',
		id: 'imageVersion',
		label: 'Image version',
	});

	const name = useInput({
		initialValue: selectedBox?.name || '',
		validate: name =>
			/^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/gm.test(name),
		id: 'name',
		label: 'Name',
	});

	const type = useInput({
		initialValue: selectedBox?.kind || '',
		id: 'type',
		label: 'Type',
	});

	function saveChanges() {
		const isConfigValid =
			[customConfig, pinsConfig, imageName, imageVersion, name, type].every(
				input => input.isValid,
			) &&
			isValidJSONArray(pinsConfig.value) &&
			isValidJSONObject(customConfig.value);

		const originalBox = toJS(selectedBox);
		if (isConfigValid && originalBox) {
			const updatedBox = applyBoxChanges(originalBox, {
				kind: type.value,
				name: name.value,
				spec: {
					...originalBox.spec,
					'custom-config': customConfig.value ? JSON.parse(customConfig.value) : '',
					'image-name': imageName.value,
					'image-version': imageVersion.value,
					'extended-settings': extendedSettings.value ? JSON.parse(extendedSettings.value) : '',
					pins: JSON.parse(pinsConfig.value),
				},
			});
			boxUpdater.saveBoxChanges(originalBox, updatedBox);
		}
	}

	return (
		<div className={classes.container}>
			<div className={classes.inputGroup}>
				<Input inputConfig={imageName} />
				<Input inputConfig={imageVersion} />
				<Input inputConfig={name} />
				<Input inputConfig={type} />
			</div>
			<h5 className={classes.codeEditorLabel}>Custom Config</h5>
			<ConfigEditor value={customConfig.value} setValue={customConfig.setValue} />
			<h5 className={classes.codeEditorLabel}>Pins</h5>
			<ConfigEditor
				value={pinsConfig.value}
				setValue={pinsConfig.setValue}
				schema={pinSchema}
				pinsConnectionsLenses
			/>
			<h5 className={classes.codeEditorLabel}>Extended settings</h5>
			<ConfigEditor
				value={extendedSettings.value}
				setValue={extendedSettings.setValue}
				schema={extenedSchema}
			/>
			<button disabled={!isSelectedBoxValid} onClick={saveChanges}>
				Save
			</button>
		</div>
	);
}

export default observer(Config);

interface ConfigurableBoxOptions {
	kind: BoxEntity['kind'];
	name: BoxEntity['name'];
	spec: {
		'custom-config': BoxEntity['spec']['custom-config'];
		'image-name': BoxEntity['spec']['image-name'];
		'image-version': BoxEntity['spec']['image-version'];
		'extended-settings': BoxEntity['spec']['extended-settings'];
		pins: BoxEntity['spec']['pins'];
	};
}

function applyBoxChanges(box: BoxEntity, { kind, name, spec }: ConfigurableBoxOptions): BoxEntity {
	const boxCopy = isObservable(box) ? toJS(box) : cloneDeep(box);

	return {
		...boxCopy,
		kind,
		name,
		spec: {
			...boxCopy.spec,
			...spec,
		},
	};
}
