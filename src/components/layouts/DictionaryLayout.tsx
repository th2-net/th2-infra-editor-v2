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
		height: 700,
		display: 'grid',
		gridTemplateRows: 'auto 1fr auto',
		placeItems: 'start',
	},
});

function DictionaryLayout() {
	const classes = useStyles();
	const { dictionary, editDictionary } = useSelectedDictionaryStore();
	const { setViewType } = useAppViewStore();

	return (
		dictionary && (
			<div className={classes.dictionaryLayout}>
				<button onClick={() => setViewType(AppViewType.BoxView)}>back</button>
				<DictionaryEditor dictionary={dictionary} editDictionary={editDictionary} />
				<BoxLinksEditor />
			</div>
		)
	);
}

export default observer(DictionaryLayout);
