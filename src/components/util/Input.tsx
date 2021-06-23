/** ****************************************************************************
 * Copyright 2009-2020 Exactpro (Exactpro Systems Limited)
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

import classNames from 'classnames';
import { createUseStyles } from 'react-jss';
import { InputConfig } from '../../hooks/useInput';

const useStyles = createUseStyles(
	{
		container: {
			display: 'flex',
			flexDirection: 'column',
		},
		input: {
			width: '100%',
      height: 21,
			backgroundColor: '#fff',
			border: '1px solid #7a99b8',
			borderRadius: 4,
			padding: '0 10px',
			fontSize: 13,
			lineHeight: '14px',
			outlineColor: 'green',
		},
		label: {
			fontSize: 12,
			lineHeight: '14px',
			marginBottom: '6px',
		},
		invalid: {
			outline: 'none',
			border: '2px solid red',
		},
	},
	{ name: 'Input' },
);

interface InputProps {
	inputConfig: InputConfig;
}

const Input = ({ inputConfig }: InputProps) => {
	const classes = useStyles();

	return (
		<div className={classes.container}>
			<label htmlFor={inputConfig.bind.id} className={classes.label}>
				{inputConfig.label}
			</label>
			<input
				{...inputConfig.bind}
				type='text'
				className={classNames(classes.input, {
					[classes.invalid]: !inputConfig.isValid && inputConfig.isDirty,
				})}
				list={inputConfig.autocomplete?.datalistKey}
				autoComplete='off'
			/>
			{inputConfig.autocomplete && inputConfig.value.length > 0 && (
				<datalist id={inputConfig.autocomplete.datalistKey}>
					{inputConfig.autocomplete.variants.map((variant, index) => (
						<option key={index} value={variant} />
					))}
				</datalist>
			)}
		</div>
	);
};
export default Input;
