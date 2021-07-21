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

import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { buttonReset } from '../../styles/mixins';
import { createUseStyles } from 'react-jss';
import { useEntityEditor } from '../../hooks/useEntityEditor';
import { BoxEntity } from '../../models/Box';
import { DictionaryEntity } from '../../models/Dictionary';
import Switcher, { SwitcherCase } from '../util/Switcher';
import CommonEditor from '../editors/CommonEditor';
import Icon from '../Icon';

enum NewEntityType {
	BOX = 'box',
	DICTIONARY = 'dictionary',
}

const switcherConfig: SwitcherCase<NewEntityType>[] = Object.values(NewEntityType).map((name, i) => ({
	value: name,
	id: `${i}-${name}`,
	name: 'entity-type',
	label: <Icon id={name} stroke='black'/> 
}))

const defaultBox: BoxEntity = {
	name: '',
	kind: 'Th2Box',
	spec: {
		type: '',
		"image-name": '',
		"image-version": '',
		"node-port": undefined,
		"extended-settings": {
			service: {
				enabled: true
			}
		}
	}
}

const defaultDictionary: DictionaryEntity = {
	name: '',
	kind: 'Th2Dictionary',
	spec: {
		data: ''
	}
}

const useStyles = createUseStyles({
	container: {

	},
	add: {
		...buttonReset()
	}
});

function NewEntityLayout() {
	const classes = useStyles();
	const [type, setType] = useState<NewEntityType>(NewEntityType.BOX);
	const { setActionType, setEntity, apply } = useEntityEditor();

	useEffect(() => {
		setActionType('add');
		return () => {
			setActionType('update');
		}
	}, [])

	useEffect(() => {
		if (type === NewEntityType.BOX) {
			setEntity(defaultBox);
		} else {
			setEntity(defaultDictionary);
		}
	})

	return (
		<div className={classes.container}>
			<Switcher cases={switcherConfig} currentCase={type} setCurrentCase={setType}/>
			<CommonEditor isNewEntity/>
			<button className={classes.add} onClick={apply}>Add</button>
		</div>
	);
}

export default observer(NewEntityLayout);
