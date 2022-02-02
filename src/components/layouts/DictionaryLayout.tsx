/** *****************************************************************************
 * Copyright 2020-2020 Exactpro (Exactpro Systems Limited)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by DictionaryLayoutlicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************** */

import { createUseStyles } from 'react-jss';
import { useSelectedDictionaryStore } from '../../hooks/useSelectedDictionaryStore';
import BoxLinksEditor from '../editors/BoxLinksEditor';
import DictionaryEditor from '../editors/DictionaryEditor';
import { useAppViewStore } from '../../hooks/useAppViewStore';
import { observer } from 'mobx-react-lite';
import AppViewType from '../../util/AppViewType';

const useStyles = createUseStyles({
	dictionaryLayout: {
		width: '100%',
		height: '100%',
		display: 'grid',
		gridTemplateRows: 'auto 400px 1fr',
		placeItems: 'start',
	},
	button: {
		margin: '3px 0 24px 0',
		height: '40px',
		width: 'auto',
		borderRadius: '4px',
		color: '#fff',
		padding: '12px 24px',
		textTransform: 'capitalize',
		outline: 'none',
		border: 'none',
		fontWeight: '500',
		fontSize: '14px',
		lineHeight: '16px',
		position: 'relative',
		cursor: 'pointer',
		backgroundColor: '#4E4E4E',
		'&:hover': {
			backgroundColor: '#EEF2F6',
			color: 'rgba(51, 51, 51, 0.8)',
		},
		'&:active': {
			backgroundColor: '#0099E5',
		},
		'&:disabled': {
			opacity: '0.4',
		},
	},
	controls: {
		display: 'flex',
		height: 'fit-content',
		margin: '36px 69px 0 0',
		gap: 16,
		alignItems: 'center',
	},
});

function DictionaryLayout() {
	const classes = useStyles();
	const { dictionary, editDictionary } = useSelectedDictionaryStore();
	const { setViewType } = useAppViewStore();

	return (
		dictionary && (
			<div className={classes.dictionaryLayout}>
				<button onClick={() => setViewType('box')}></button>
				<button className={classes.button} onClick={() => setViewType(AppViewType.BoxView)}>
					{' '}
					Go Back
				</button>
				<DictionaryEditor dictionary={dictionary} editDictionary={editDictionary} />
				<BoxLinksEditor />
			</div>
		)
	);
}

export default observer(DictionaryLayout);
