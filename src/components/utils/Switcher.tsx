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

import { Fragment, ReactNode } from 'react';
import { createUseStyles } from "react-jss";
import { visuallyHidden } from '../../styles/mixins';

interface SwitcherProps<T extends string> {
	cases: SwitcherCase<T>[];
	currentCase: T;
	setCurrentCase: (entity: T) => void;
}

export interface SwitcherCase<T extends string> {
	id: T;
	name: string;
	label: ReactNode;
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

export default function Switcher<T extends string>({cases, currentCase, setCurrentCase}: SwitcherProps<T>) {
	const classes = useSwitcherStyles();
	return (
		<div className={classes.switcher}>
			{
				cases.map((item: SwitcherCase<T>, i: number) => (
					<Fragment key={item.id}>
						<input
							className={classes.switcherInput}
							type='radio' 
							name={item.name}
							id={item.id} 
							onClick={() => {setCurrentCase(item.id)}}
							defaultChecked={currentCase === item.id}
						/>
						<label
							title={`${item.id.charAt(0).toUpperCase()}${item.id.slice(1)}`}
							htmlFor={item.id}
							className={classes.switcherLabel}
						>
							{item.label}
						</label>
					</Fragment>
				))
			}
		</div>
	)
}
