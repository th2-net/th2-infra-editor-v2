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

import { observer } from 'mobx-react-lite';
import { createUseStyles } from 'react-jss';
import BoxLayout from './BoxLayout';
import DictionaryLayout from './DictionaryLayout';
import { useSchemaStore } from '../../hooks/useSchemaStore';

interface WindowProps {
	isEditing: boolean;
}

const useWindowStyles = createUseStyles({
	window: {
		display: 'grid',
		gridArea: 'window',
		gap: (props: WindowProps) => props.isEditing ? 0 : 10,
		gridTemplateColumns: (props: WindowProps) => props.isEditing ? '1fr' : 'auto',
		gridTemplateRows: (props: WindowProps) => props.isEditing ? '1fr' : '1fr 400px',
		gridTemplateAreas: (props: WindowProps) => props.isEditing
		? `
				"window window"
				"window window"
			`
		: `
				"config metrics"
				"links links"
			`
	}
})

function Window() {
	const schemaStore = useSchemaStore();
	const classes = useWindowStyles({isEditing: Boolean(schemaStore.selectedDictionary)})

	return (
		<div className={classes.window}>
			{
				schemaStore.selectedDictionary
					? <DictionaryLayout 
							dictionary={schemaStore.selectedDictionary}
							resetDictionary={() => {schemaStore.selectDictionary(null)}}
						/>
					: <BoxLayout />
			}
		</div>
	);
}

export default observer(Window);
