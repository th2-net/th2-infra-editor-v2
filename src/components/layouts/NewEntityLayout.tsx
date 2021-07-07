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

import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { visuallyHidden } from '../../styles/mixins';
import Icon from '../Icon';

const useStyles = createUseStyles({
	container: {

	}
});

type EntityType = 'box' | 'dictionary';

interface SwitcherProps {
	entityType: EntityType;
	setEntityType: (entity: EntityType) => void;
}

const useSwitcherStyles = createUseStyles(
	{
		switcher: {
			display: 'flex'
		},
		switcherInput: {
			...visuallyHidden(),
			'&:checked': {
				'&+label': {
					backgroundColor: '#fff'
				}
			}
		},
		switcherLabel: {
			display: 'inline-flex',
			verticalAlign: 'middle',
			padding: 6,
			cursor: 'pointer',
		}
	},
);

function Switcher({entityType, setEntityType}: SwitcherProps) {
	const classes = useSwitcherStyles();
	return (
		<div className={classes.switcher}>
			<input
				className={classes.switcherInput}
				type='radio' 
				name='filter' 
				id='box' 
				onClick={() => {setEntityType('box')}}
				checked={entityType === 'box'}
			/>
			<label
				title="Box"
				htmlFor='box'
				className={classes.switcherLabel}
			>
				<Icon id='box' stroke='black' />
			</label>
			<input
				className={classes.switcherInput}
				type='radio' 
				name='filter' 
				id='dictionary' 
				onClick={() => {setEntityType('dictionary')}}
				checked={entityType === 'dictionary'}
			/>
			<label
				title="Dictionary"
				htmlFor='dictionary'
				className={classes.switcherLabel}
			>
				<Icon id='book' stroke='black' />
			</label>
		</div>
	)
}

function NewEntityLayout() {
	const classes = useStyles();
	const [entity, setEntity] = useState<EntityType>('box');
	return (
		<div className={classes.container}>
			<Switcher entityType={entity} setEntityType={setEntity}/>
			new entity
		</div>
	);
}

export default NewEntityLayout;
 