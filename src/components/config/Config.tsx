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
import { scrollBar, visuallyHidden } from '../../styles/mixins';
import { Theme } from '../../styles/theme';
import ConfigEditor from './ConfigEditor';
import Input from '../util/Input';
import { BoxEntity } from '../../models/Box';
import { cloneDeep } from 'lodash';
import { useBoxUpdater } from '../../hooks/useBoxUpdater';
import { useState } from 'react';

const useStyles = createUseStyles((t: Theme) => ({
	container: {
		display: 'grid',
		gridTemplateRows: 'auto auto auto 1fr auto',
		gap: '16px',
		overflowY: 'hidden',
		backgroundColor: '#FFF',
		border: 'none',
		borderRadius: 24,
		boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.16)',
		padding: 24,
		...scrollBar(),
	},

	header: {
		width: '100%',
		fontWeight: 700,
		fontSize: '16px',
	},

	inputGroup: {
		display: 'grid',
		color: 'rgba(51, 51, 51, 0.6)',
		gridTemplateColumns: 'repeat(4, 1fr)',
		gap: '10px',
		marginBottom: 8,
	},

	saveButton: {
		width: 'fit-content',
		border: 'none',
		padding: '8px 16px',
		backgroundColor: '#0099E5',
		borderRadius: 4,
		color: '#FFF',
		fontSize: '14px',
		fontWeight: 500,
		cursor: 'pointer',
	},
}));

function Config() {
	const [filter, setFilter] = useState<ConfigFilters>('customConfig');
	const classes = useStyles();

	const { selectedBox } = useBoxesStore();
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
		validate: name => name.length > 0,
		id: 'imageName',
		label: 'Image name',
	});

	const imageVersion = useInput({
		initialValue: selectedBox?.spec['image-version'] || '',
		validate: version => version.length > 0,
		id: 'imageVersion',
		label: 'Image version',
	});

	const name = useInput({
		initialValue: selectedBox?.name || '',
		validate: name =>
			name.trim().length > 0 &&
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
			<div className={classes.header}>Box configuration</div>
			<div className={classes.inputGroup}>
				<Input inputConfig={imageName} />
				<Input inputConfig={imageVersion} />
				<Input inputConfig={name} />
				<Input inputConfig={type} />
			</div>
			<ConfigFilter filter={filter} setFilter={setFilter} />
			{filter === 'customConfig' ? (
				<ConfigEditor value={customConfig.value} setValue={customConfig.setValue} />
			) : filter === 'pins' ? (
				<ConfigEditor value={pinsConfig.value} setValue={pinsConfig.setValue} />
			) : (
				<ConfigEditor value={extendedSettings.value} setValue={extendedSettings.setValue} />
			)}
			<button className={classes.saveButton} onClick={saveChanges}>
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

type ConfigFilters = 'customConfig' | 'pins' | 'extendedSettings';

interface FiltersProps {
	filter: ConfigFilters;
	setFilter: (filter: ConfigFilters) => void;
}

const useConfigFiltersStyles = createUseStyles({
	filters: {
		display: 'flex',
		lineHeight: '16px',
		fontSize: '12px',
		color: '#333333',
		borderRadius: 4,
		gap: 12,
	},
	filtersInput: {
		...visuallyHidden(),
		'&:checked': {
			'&+label': {
				backgroundColor: '#5CBEEF',
				color: '#FFF',
				border: '1px solid #0099E5',
				boxSizing: 'border-box',
			},
		},
	},
	filtersLabel: {
		display: 'inline-flex',
		backgroundColor: '#F3F3F6',
		verticalAlign: 'middle',
		padding: '8px 12px',
		border: '1px solid #E5E5E5',
		borderRadius: 4,
		cursor: 'pointer',
	},
});

function ConfigFilter({ filter, setFilter }: FiltersProps) {
	const classes = useConfigFiltersStyles();
	return (
		<div className={classes.filters}>
			<input
				className={classes.filtersInput}
				type='radio'
				name='configFilter'
				onChange={() => {
					setFilter('customConfig');
				}}
				id='customConfig'
				checked={filter === 'customConfig'}
			/>
			<label title='Custom Config' htmlFor='customConfig' className={classes.filtersLabel}>
				Custom Config
			</label>
			<input
				className={classes.filtersInput}
				type='radio'
				name='configFilter'
				id='pins'
				onChange={() => {
					setFilter('pins');
				}}
				checked={filter === 'pins'}
			/>
			<label title='Pins' htmlFor='pins' className={classes.filtersLabel}>
				Pins
			</label>
			<input
				className={classes.filtersInput}
				type='radio'
				name='configFilter'
				id='extendedSettings'
				onChange={() => {
					setFilter('extendedSettings');
				}}
				checked={filter === 'extendedSettings'}
			/>
			<label title='Extended Settings' htmlFor='extendedSettings' className={classes.filtersLabel}>
				Extended Settings
			</label>
		</div>
	);
}
