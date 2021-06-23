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
import { DictionaryEntity } from '../../models/Dictionary';
import DictionaryEditor from '../editors/DictionaryEditor';

interface DictionaryLayoutProps {
	dictionary: DictionaryEntity | null;
	resetDictionary: () => void;
}

const useStyles = createUseStyles({
	dictionary_layout: {

	}
});

function DictionaryLayout({ dictionary, resetDictionary }: DictionaryLayoutProps) {
	const classes = useStyles();

	return (
		<div className={classes.dictionary_layout}>
			<button onClick={resetDictionary}>back</button>
			<DictionaryEditor dictionary={dictionary}/>
		</div>
	);
}

export default DictionaryLayout;
