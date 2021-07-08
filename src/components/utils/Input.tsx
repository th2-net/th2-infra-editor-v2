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

import { InputConfig } from '../../hooks/useInput';
import { createUseStyles } from "react-jss";

interface InputProps {
	inputConfig: InputConfig;
}

const useStyles = createUseStyles({
	wrapper: {

	},
	input: {
		height: '30px',
		width: '100%',
		backgroundColor: 'f#ff',
		border: (props: InputConfig) => props.isValid ? '1px solid #7a99b8' : '2px solid red',
		borderRadius: '4px',
		padding: '0 10px',
		fontSize: '13px',
		lineHeight: '14px',
		outlineColor: (props: InputConfig) => props.isValid ? 'green' : 'none',
		color: '#333333',
	},
	label: {

	},
})

const Input = ({ inputConfig }: InputProps) => {
	const classes = useStyles(inputConfig);
	return (
		<div className={classes.wrapper}>
			<label htmlFor={inputConfig.bind.id} className={classes.label}>
				{inputConfig.label}
			</label>
			<input
				{...inputConfig.bind}
				type='text'
				className={classes.input}
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
