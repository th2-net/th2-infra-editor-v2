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

type StylesProps = {
	width: number | undefined;
};

const useStyles = createUseStyles<string, StylesProps>(
	{
		container: {
			width: '100%',
			minWidth: ({ width }) => (width ? `${width}px` : '100px'),
			display: 'flex',
			flexDirection: 'column',
		},
		input: {
			height: 32,
			backgroundColor: '#fff',
			color: 'rgba(51, 51, 51, 0.6)',
			border: '1px solid #E5E5E5',
			boxSizing: 'border-box',
			borderRadius: 4,
			padding: '0 10px',
			fontSize: 14,
			fontWeight: 400,
			lineHeight: '14px',
			outlineColor: '#5CBEEF',
		},
		label: {
			fontSize: 14,
			lineHeight: '14px',
			marginBottom: '12px',

			'&.required:after': {
				content: '"*"',
				color: 'red',
				marginLeft: '2px',
				verticalAlign: 'super',
			},
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
	width?: number;
}

const Input = ({ inputConfig, width }: InputProps) => {
	const classes = useStyles({ width });

	return (
		<div className={classes.container}>
			<label
				htmlFor={inputConfig.bind.id}
				className={classNames(classes.label, {
					required: inputConfig.required,
				})}>
				{inputConfig.label}
			</label>
			<input
				disabled={inputConfig.isDisabled}
				{...inputConfig.bind}
				type='text'
				className={classNames(classes.input, {
					[classes.invalid]: !inputConfig.isValid && inputConfig.isDirty,
				})}
				list={inputConfig.autocomplete?.datalistKey}
				autoComplete='off'
				placeholder={inputConfig.placeholder}
			/>
			{inputConfig.autocomplete && (
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
