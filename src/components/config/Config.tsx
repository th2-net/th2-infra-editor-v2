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
import { Theme } from '../../styles/theme';

const useStyles = createUseStyles((t: Theme) => ({
	container: {
		border: '1px solid',
		gridArea: 'config',
		borderRadius: 6,
	},
}));

function Config() {
	const classes = useStyles();

	return (
		<div className={classes.container}>
			<h2>Config</h2>
		</div>
	);
}

export default Config;