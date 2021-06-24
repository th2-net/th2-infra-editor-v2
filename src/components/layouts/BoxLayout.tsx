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
import Config from '../config';
import Links from '../links';
import Metrics from '../Metrics';

const useStyles = createUseStyles({
	container: {
		display: 'grid',
		gridTemplateAreas: `
			"config metrics"
			"links links"
		`,
		gridTemplateRows: '1fr 350px',
		gridTemplateColumns: '1fr 1fr',
		gap: 8,
		height: '100%',
    overflow: 'hidden',
	},
});

function BoxLayout() {
	const classes = useStyles();

	return (
		<div className={classes.container}>
			<Config />
			<Metrics />
			<Links />
		</div>
	);
}

export default BoxLayout;