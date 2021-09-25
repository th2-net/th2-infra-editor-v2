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

const useStyles = createUseStyles({
	container: {
		display: 'grid',
		gap: 8,
		height: '100%',
		overflow: 'hidden',
	},
});

function BoxLayout() {
	const classes = useStyles();

	return (
		<div className={classes.container}>
			<SplitView
				topComponent={<Links />}
				bottomComponent={<ConfigAndMetricsLayout />}
				splitter={<Splitter />}
			/>
		</div>
	);
}

export default BoxLayout;
