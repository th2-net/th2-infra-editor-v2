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

import { useRef } from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';
import { BoxEntity, BoxStatus } from '../../models/Box';
import { Theme } from '../../styles/theme';

export function getBoxType(box: BoxEntity) {
	return box.spec.type ? box.spec.type.split('-').slice(1).join('-') : box.name
}

const useStyles = createUseStyles(
	(theme: Theme) => ({
		container: {
			width: '100%',
			backgroundColor: '#fff',
			minHeight: 70,
			borderRadius: 6,
			overflow: 'hidden',
			display: 'grid',
			gridTemplateRows: '25px 1fr',
			cursor: 'pointer'
		},
		header: {
			height: 25,
			width: '100%',
			display: 'flex',
			alignItems: 'center',
			padding: '0 10px',
			backgroundColor: 'rgb(102, 204, 145)',
			color: '#fff',
		},
		name: {
			margin: '0 0 0 5px',
			fontSize: 12,
		},
		body: {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			height: '100%',
			padding: '0 20px',
		},
		bodyValue: {
			fontSize: '12px',
			lineHeight: '15px',
			fontWeight: 'bold',
			borderRadius: 9,
			padding: '0 4px 2px',
		},
		type: {
			color: '#fff',
			flexShrink: 0,
			backgroundColor: 'rgb(102, 204, 145)',
		},
		selectable: {
			cursor: 'pointer',
			'&:hover': {
				border: '2px solid',
			},
		},
		selected: {
			border: '2px solid',
		},
	}),
	{ name: 'Box' },
);

interface Props {
	box: BoxEntity;
	color?: string;
	onSelect?: (box: BoxEntity) => void;
	isSelected?: boolean;
}

function Box(props: Props) {
	const { box, color, onSelect, isSelected = false } = props;
	const classes = useStyles();

	// TODO: fix status
	const status = useRef(Object.values(BoxStatus)[box.name.length % 2]);

	const imageName = box.spec['image-name'];
	const splitedImageName = imageName.split('/');
	const slicedImageName = splitedImageName.slice(-(splitedImageName.length - 1)).join('/');

	return (
		<div
			className={classNames(classes.container, {
				[classes.selectable]: typeof onSelect === 'function',
				[classes.selected]: isSelected,
			})}
			onClick={() => onSelect && onSelect(box)}>
			<div className={classes.header} style={{ backgroundColor: color }}>
				<Status status={status.current} />
				<h5 className={classes.name}>{box.name}</h5>
			</div>
			<div className={classes.body}>
				<span
					style={{ backgroundColor: color }}
					className={classNames(classes.bodyValue, classes.type)}>
					{getBoxType(box)}
				</span>
				<span className={classes.bodyValue}>{slicedImageName}</span>
			</div>
		</div>
	);
}

export default Box;

const useStatusStyles = createUseStyles(
	{
		status: {
			height: 11,
			width: 11,
			borderRadius: '50%',
			border: '1px solid #fff',
			backgroundColor: '#8b8b8b',
		},
		Running: {
			backgroundColor: '#14d314',
		},
		Pending: {
			backgroundColor: '#e0e013',
		},
		Failed: {
			backgroundColor: '#e61010',
		},
	},
	{ name: 'Status' },
);

interface StatusProps {
	status: BoxStatus;
}

export function Status({ status }: StatusProps) {
	const classes = useStatusStyles();

	const statusClassaname = classNames(classes.status, classes[status]);

	return <div className={statusClassaname} />;
}
