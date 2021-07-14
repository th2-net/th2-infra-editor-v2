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
import { AppView } from '../../App';
import { useSelectedDictionaryStore } from '../../hooks/useSelectedDictionaryStore';
import BoxLinksEditor from '../editors/BoxLinksEditor';
import DictionaryEditorControls from '../editors/DictionaryEditorControls';
import UnionEditor from '../editors/UnionEditor';

interface Props {
	setViewType: (viewType: AppView) => void;
}

const useStyles = createUseStyles({
	dictionaryLayout: {},
});

function DictionaryLayout({ setViewType }: Props) {
	const classes = useStyles();

	return (
		<div className={classes.dictionaryLayout}>
			<button onClick={() => setViewType('box')}>back</button>
			<UnionEditor />
			<DictionaryEditorControls />
			<BoxLinksEditor />
		</div>
	);
}

export default DictionaryLayout;
