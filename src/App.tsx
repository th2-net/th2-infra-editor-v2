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
import Header from './components/Header';
import Boxes from './components/boxes';
import DictionaryLayout from './components/layouts/DictionaryLayout';
import BoxLayout from './components/layouts/BoxLayout';
import { useSchemaStore } from './hooks/useSchemaStore';
import { Theme } from './styles/theme';
import { useRootStore } from './hooks/useRootStore';
import openSansRegular from './assets/fonts/open-sans-v15-latin-regular.woff';
import openSansBold from './assets/fonts/open-sans-v15-latin-600.woff';
import { useAppViewStore } from './hooks/useAppViewStore';
import AppViewType from './models/AppViewType';
import { useURLParamsStore } from './hooks/useURLParamsStore';
import EmbeddedLayout from './components/embedded/EmbeddedLayout';

const useStyles = createUseStyles((theme: Theme) => ({
	'@font-face': [
		{
			fontFamily: 'Open sans',
			fontWeight: 'normal',
			src: `url(${openSansRegular})`,
		},
		{
			fontFamily: 'Open sans',
			fontWeight: 'bold',
			src: `url(${openSansBold})`,
		},
	] as any,
	'@global': {
		'*': {
			boxSizing: 'border-box',
			fontFamily: 'Open Sans',
		},
		body: {
			height: '100vh',
			overflow: 'hidden',
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
		overflow: 'hidden',
	},
	content: {
		gridArea: 'content',
		display: 'grid',
		gap: 10,
		gridTemplateColumns: 'minmax(250px, 350px) 1fr',
		gridTemplateAreas: '"box-list ."',
		padding: '0 15px',
		overflow: 'hidden',
	},
	loader: {
		placeSelf: 'center',
	},
}));

function App() {
	const rootStore = useRootStore();
	const schemaStore = useSchemaStore();
	const classes = useStyles();
	const { viewType, setViewType } = useAppViewStore();
	const { embedded } = useURLParamsStore();

	useEffect(() => {
		rootStore.init();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (embedded) {
		return <EmbeddedLayout />;
	}

	return (
		<div className={classes.app}>
			<Header />
			{!schemaStore.isLoading ? (
				<div className={classes.content}>
					<Boxes />
					{viewType === AppViewType.Dictionary && <DictionaryLayout setViewType={setViewType} />}
					{viewType === AppViewType.Box && <BoxLayout />}
				</div>
			) : (
				<div className={classes.loader}>Loading...</div>
			)}
		</div>
	);
}

export default observer(App);
