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

import { Styles } from 'jss';

export function scrollBar(thumbColor = 'rgba(0,0,0,.22)'): Styles {
	return {
		'&::-webkit-scrollbar': {
			height: 6,
			width: 6,
			backgroundColor: 'rgba(0,0,0,0)',
		},
		'&::-webkit-scrollbar-track': {
			backgroundColor: 'rgba(0,0,0,0)',
		},
		'&::-webkit-scrollbar-thumb': {
			backgroundColor: thumbColor,
			borderRadius: 40,
			height: 40,
		},
		'&::-webkit-scrollbar-button': {
			display: 'none',
		},
	};
}

export function ellipsis(): Styles {
	return {
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	};
}

export function visuallyHidden(): Styles {
	return {
		position: 'absolute',
		overflow: 'hidden',
		clip: 'rect(1px, 1px, 1px, 1px)',
		width: '1px',
		height: '1px',
		margin: '-1px',
		padding: '0',
		clipPath: 'inset(50%)',
	};
}

export function buttonReset(): Styles {
	return {
		padding: '0',
		border: 'none',
		outline: 'none',
		cursor: 'pointer',
		backgroundColor: 'transparent',
	};
}

export function button(): Styles {
	return {
		...buttonReset(),
		height: '30px',
		width: 'auto',
		borderRadius: '17px',
		color: '#fff',
		padding: '7px 12px',
		textTransform: 'capitalize',
		outline: 'none',
		border: 'none',
		margin: '0 15px',
		boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
		fontWeight: '600',
		fontSize: '13px',
		lineHeight: '16px',
		position: 'relative',
		transition: '250ms',
		userSelect: 'none',
	};
}
