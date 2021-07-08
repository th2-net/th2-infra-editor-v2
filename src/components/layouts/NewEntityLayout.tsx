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
import { EntityTypes } from '../../stores/NewEntityStore';
import Switcher, { SwitcherCase } from '../utils/Switcher';
import Icon from '../Icon';
import { useNewEntityStore } from '../../hooks/useNewEntityStore';
import { observer } from 'mobx-react-lite';
import DictionaryEditor from '../editors/DictionaryEditor';

const useStyles = createUseStyles({
	container: {

	}
});

const switcherConfig: SwitcherCase<EntityTypes>[] = Object.values(EntityTypes).map(value => ({
	id: value,
	name: 'entities',
	label: <Icon id={value} stroke='black' />
}))

function NewEntityLayout() {
	const classes = useStyles();
	const {
		entityType,
		setEntityType,
		newDictionary,
		setNewDictionaryConfig,
		setNewDictionaryName,
		addNewDictionary
	} = useNewEntityStore();

	return (
		<div className={classes.container}>
			<Switcher 
				cases={switcherConfig}
				currentCase={entityType}
				setCurrentCase={setEntityType}
			/>
			{
				entityType === 'dictionary'
					? <DictionaryEditor 
							dictionary={newDictionary}
							setConfigValue={setNewDictionaryConfig}
							setNameValue={setNewDictionaryName}
							apply={addNewDictionary}
						/>
					: 'new box'
			}
		</div>
	);
}

export default observer(NewEntityLayout);
 