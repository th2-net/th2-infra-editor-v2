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

import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { createUseStyles } from 'react-jss';
import Boxes from './components/boxes';
import Config from './components/config';
import Header from './components/Header';
import Links from './components/links';
import Metrics from './components/Metrics';
import { useSchemaStore } from './hooks/useSchemaStore';
import { Theme } from './styles/theme';
import { useRootStore } from './hooks/useRootStore';

const useStyles = createUseStyles((theme: Theme) => ({
	'@font-face': [
		{
			fontFamily: 'Open sans',
			fontWeight: 'normal',
			src: 'url(fonts/open-sans-v15-latin-regular.woff)',
		},
		{
			fontFamily: 'Open sans',
			fontWeight: 'bold',
			src: 'url(fonts/open-sans-v15-latin-600.woff)',
		},
	] as any,
	'@global': {
		'*': {
			boxSizing: 'border-box',
			fontFamily: 'Open Sans',
		},
		body: {
			height: '100vh',
		},
		'#root': {
			height: '100%',
		},
	},
	app: {
		display: 'grid',
		gridTemplateRows: '60px 1fr',
		gridTemplateAreas: `
			"header"
			"content"
		`,
		gap: 10,
		height: '100%',
		backgroundColor: theme.appBackgroundColor,
	},
	content: {
		gridArea: 'content',
		display: 'grid',
		gap: 10,
		gridTemplateColumns: 'minmax(250px, 350px) 1fr 1fr',
		gridTemplateRows: '1fr 400px',
		gridTemplateAreas: `
			"box-list config metrics"
			"box-list links links"
		`,
		padding: '0 15px',
	},
	loader: {
		placeSelf: 'center',
	},
}));

function App() {
	const rootStore = useRootStore();
	const schemaStore = useSchemaStore();
	const classes = useStyles();

	useEffect(() => {
		rootStore.init();
	}, []);

	return (
		<div className={classes.app}>
			<Header />
			{!schemaStore.isLoading ? (
				<div className={classes.content}>
					<Boxes />
					<Config />
					<Metrics />
					<Links />
				</div>
			) : (
				<div className={classes.loader}>Loading...</div>
			)}
		</div>
	);
}

export default observer(App);
