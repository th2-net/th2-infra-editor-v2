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

import { createUseStyles } from 'react-jss';
import Links from '../links';
import ConfigAndMetricsLayout from './ConfigAndMetricsLayout';
import SplitView from '../splitView/SplitView';
import Splitter from '../util/Splitter';
import { useBoxesStore } from '../../hooks/useBoxesStore';
import classnames from 'classnames';
import { reaction } from 'mobx';
import { useEffect } from 'react';
import { useInput } from '../../hooks/useInput';

const useStyles = createUseStyles({
	container: {
		display: 'grid',
		gap: 8,
		height: '100%',
		overflow: 'hidden',
	},
	noBoxSelected: {
		display: 'grid',
		placeItems: 'center',
	},
});

function BoxLayout() {
	const classes = useStyles();
	const boxesStore = useBoxesStore();

	const customConfig = useInput({
		initialValue: '',
		id: 'custom-config',
	});

	const pinsConfig = useInput({
		initialValue: '',
		id: 'custom-config',
	});

	const extendedSettings = useInput({
		initialValue: '',
		id: 'extended-settings',
	});

	const imageName = useInput({
		initialValue: '',
		validate: name => name.length > 0,
		id: 'imageName',
		label: 'Image name',
	});

	const imageVersion = useInput({
		initialValue: '',
		validate: version => version.length > 0,
		id: 'imageVersion',
		label: 'Image version',
	});

	const name = useInput({
		initialValue: '',
		validate: name =>
			name.trim().length > 0 &&
			/^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/gm.test(name),
		id: 'name',
		label: 'Name',
	});

	const type = useInput({
		initialValue: '',
		id: 'type',
		label: 'Type',
	});

	useEffect(() => {
		const boxSubscription = reaction(
			() => boxesStore.selectedBox,
			box => {
				customConfig.setValue(
					box && box?.spec['custom-config']
						? JSON.stringify(box?.spec['custom-config'], null, 4)
						: '',
				);
				pinsConfig.setValue(box && box.spec.pins ? JSON.stringify(box.spec.pins, null, 4) : '');
				imageName.setValue(box?.spec['image-name'] || '');
				imageVersion.setValue(box?.spec['image-version'] || '');
				extendedSettings.setValue(
					box?.spec['extended-settings']
						? JSON.stringify(box?.spec['extended-settings'], null, 4)
						: '',
				);
				name.setValue(box?.name || '');
				type.setValue(box?.kind || '');
			},
		);
		return boxSubscription;
	}, []);

	return boxesStore.selectedBox ? (
		<div className={classes.container}>
			<SplitView
				topComponent={<Links />}
				bottomComponent={<ConfigAndMetricsLayout />}
				splitter={<Splitter />}
			/>
		</div>
	) : (
		<div className={classnames(classes.container, classes.noBoxSelected)}>
			<p>Select a box to edit</p>
		</div>
	);
}

export default BoxLayout;
