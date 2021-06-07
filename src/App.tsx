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
import { ThemeProvider } from 'theming';
import BoxList from './components/BoxList';
import Config from './components/Config';
import Links from './components/Links';
import Metrics from './components/Metrics';
import { theme } from './theme';

const useStyles = createUseStyles({
	'@global': {
		'*': {
			boxSizing: 'border-box',
		},
		body: {
			height: '100vh',
		},
		'#root': {
			height: '100%',
		},
	},
	container: {
		display: 'grid',
		gridTemplateColumns: 'minmax(300px, 500px) 1fr 1fr',
		gridTemplateRows: '1fr 400px',
		gridTemplateAreas: `
			"box-list config metrics"
			"box-list links links"
		`,
		gap: 10,
		height: '100%',
		padding: 10,
	},
});

function App() {
	const classes = useStyles();
	return (
		<ThemeProvider theme={theme}>
			<div className={classes.container}>
				<BoxList />
				<Config />
				<Metrics />
				<Links />
			</div>
		</ThemeProvider>
	);
}

export default App;
