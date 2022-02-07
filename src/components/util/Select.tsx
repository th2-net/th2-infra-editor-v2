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

import classNames from 'classnames';
import { createUseStyles } from 'react-jss';
import Icon from '../Icon';

interface Props {
	options: string[];
	selected: string | null;
	onChange: (option: string) => void;
	openSelect: boolean;
	setOpenSelect: (value: React.SetStateAction<boolean>) => void;
	width: number;
}

const useStyles = createUseStyles({
	disable: { display: 'none' },
	selectWrapper: { border: 'none', outline: 'none', width: (width: number) => `${width}px` },
	customSelect: {
		display: 'flex',
		justifyContent: 'space-between',
		cursor: 'pointer',
		borderRadius: 4,
		padding: '5px 12px',
		width: '100%',
		margin: 2,
		backgroundColor: '#FFF',
		boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.12)',
	},
	openSelect: {
		border: '1px solid #5CBEEF',
	},
	optionsWrapper: {
		position: 'absolute',
		height: '134px',
		overflowY: 'scroll',
		boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.12)',
		borderRadius: 4,
		margin: 2,
		'&::-webkit-scrollbar': {
			display: 'none',
		},
	},
	customOption: {
		cursor: 'pointer',
		backgroundColor: '#FFF',
		border: 'none',
		width: (width: number) => `${width}px`,
		padding: '8px 12px',
	},
});

export default function Select({
	options,
	selected,
	onChange,
	openSelect,
	setOpenSelect,
	width,
}: Props) {
	const classes = useStyles(width);

	return (
		<div className={classes.selectWrapper}>
			<div
				className={classNames(classes.customSelect, openSelect ? classes.openSelect : null)}
				onClick={() => setOpenSelect(!openSelect)}>
				{selected}
				{openSelect ? (
					<Icon id='arrowUp' stroke='#5CBEEF' />
				) : (
					<Icon id='arrowDown' stroke='#808080' />
				)}
			</div>
			<div
				className={classNames(
					classes.optionsWrapper,
					!openSelect ? classes.disable : classes.openSelect,
				)}>
				{openSelect &&
					options.map(option => (
						<div key={option} className={classes.customOption} onClick={() => onChange(option)}>
							{option}
						</div>
					))}
			</div>
		</div>
	);
}
