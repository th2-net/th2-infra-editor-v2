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
 *  limitations under the License.
 ***************************************************************************** */

import { createUseStyles } from 'react-jss';
import arrowDown from '../assets/icons/arrow-down.svg';

interface Props<T> {
	options: Array<T>;
	selected: string;
	prefix?: string;
	onChange: (option: T) => void;
	onSelect?: () => void;
}

const useStyles = createUseStyles({
	select: {
		position: 'relative',
		border: '1px solid #5CBEEF',
		outline: 'none',
		cursor: 'pointer',
		borderRadius: 4,
		padding: '5px 12px',
		width: '169px',
		height: '32px',
		appearance: 'none',
		background: `url(${arrowDown})  no-repeat right #FFF`,
		backgroundPositionX: '141px',
		'&::-webkit-scrollbar': {
			display: 'none',
		},
		'&::active': {
			backgroundColor: 'red',
		},
	},
});

export default function Select<T extends string>({
	options,
	selected,
	onChange,
	onSelect,
}: Props<T>) {
	const classes = useStyles();

	return (
		<select
			className={classes.select}
			value={selected}
			onChange={e => {
				onChange(e.target.value as T);
				if (onSelect) {
					onSelect();
				}
			}}>
			{options.map((opt, index) => (
				<option key={index}>{opt}</option>
			))}
		</select>
	);
}
