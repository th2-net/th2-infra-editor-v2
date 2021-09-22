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

import React from 'react';
import { useSelectedDictionaryStore } from '../../hooks/useSelectedDictionaryStore';
import DictionaryEditor from '../editors/DictionaryEditor';
import { observer } from 'mobx-react-lite';
import {spinner} from '../../styles/spinner'
import { useSchemaStore } from '../../hooks/useSchemaStore';

const EmbeddedDictionaryEditor = () => {
	const { dictionary, editDictionary } = useSelectedDictionaryStore();
	const schemaStore = useSchemaStore();
	const classes = spinner();

	if (dictionary != null && dictionary !== undefined) {

		return <DictionaryEditor dictionary={dictionary} editDictionary={editDictionary} />;
	}

	if(!schemaStore.isDictionary){
		return <div>Dictionary not found</div>
	}

	return<div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start'}}>
		<p>Loading...</p>
		<div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: '5px'}}>
			<div className={classes.spinner} ></div>
		</div>
		
	</div>;
};

export default observer(EmbeddedDictionaryEditor);
