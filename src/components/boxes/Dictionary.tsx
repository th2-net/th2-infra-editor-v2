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
import { Theme } from '../../styles/theme';
import Icon from '../Icon';
import { DictionaryEntity } from '../../models/Dictionary';
import classNames from 'classnames';

const useStyles = createUseStyles(
	(theme: Theme) => ({
		container: {
			width: '100%',
			backgroundColor: '#fff',
			height: 32,
			borderRadius: 4,
			overflow: 'hidden',
			display: 'grid',
			gridTemplateRows: '24px auto',
			cursor: 'pointer',
			boxSizing: 'border-box',
			boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
			padding: '4px 12px',
		},
		header: {
			width: '100%',
			display: 'grid',
			alignItems: 'center',
			gridTemplateRows: '1fr',
			gridTemplateColumns: '16px minmax(41px, auto) ',
			justifyContent: 'start',
			backgroundColor: '#fff',
			color: '#000',
			fontSize: 12,
			gap: 8,
		},
		name: {
			margin: '0 0 0 5px',
			textAlign: 'left',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			lineHeight: '24px',
			fontSize: 12,
			height: '100%',
			textOverflow: 'ellipsis',
		},
		selectable: {
			cursor: 'pointer',
			'&:hover': {
				border: '2px solid #0099E6',
				padding: '2px 12px',
			},
		},
		selected: {
			border: '2px solid #0099E6',
			padding: '2px 12px',
		},
	}),
	{ name: 'Dictionary' },
);

interface Props {
	dictionary: DictionaryEntity;
	onClick: () => void;
	isSelected?: boolean;
	color?: string;
}

function Dictionary(props: Props) {
	const { dictionary, color, onClick, isSelected = false } = props;
	const classes = useStyles();

	return (
		<div
			className={classNames(classes.container, {
				[classes.selectable]: typeof onClick === 'function',
				[classes.selected]: isSelected,
			})}
			onClick={onClick}>
			<div className={classes.header} style={{ backgroundColor: color }}>
				<Icon id='dictionary' stroke='#333' fill='#333' />{' '}
				<h5 className={classes.name}>{dictionary.name}</h5>
			</div>
		</div>
	);
}

export default Dictionary;
