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

import { observer } from 'mobx-react-lite';
import { createUseStyles } from 'react-jss';
import { AppView } from '../../App';
import { useSchemaStore } from '../../hooks/useSchemaStore';
import { DictionaryEntity, DictionaryRelation } from '../../models/Dictionary';
import BoxLinksEditor from '../editors/BoxLinksEditor';
import DictionaryEditor from '../editors/DictionaryEditor';

interface Props {
	dictionary: DictionaryEntity | null;
	setViewType: (viewType: AppView) => void;
}

const useStyles = createUseStyles({
	dictionaryLayout: {},
});

function DictionaryLayout({ dictionary, setViewType }: Props) {
	const classes = useStyles();
	const schemaStore = useSchemaStore();

	const linkBoxes: DictionaryRelation[] = schemaStore.linkDictionaries
		.filter(rel => rel?.dictionary.name === dictionary?.name)

	return (
		<div className={classes.dictionaryLayout}>
			<button onClick={() => setViewType('box')}>back</button>
			<DictionaryEditor dictionary={dictionary} />
			<BoxLinksEditor links={linkBoxes}/>
		</div>
	);
}

export default observer(DictionaryLayout);
