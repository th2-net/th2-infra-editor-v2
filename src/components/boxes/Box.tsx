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
import DictionaryLinksEditor from '../editors/DictionaryLinksEditor';
import { computed } from 'mobx';
import useSubscriptionStore from '../../hooks/useSubscriptionStore';

export function getBoxType(box: BoxEntity) {
	return box.spec.type ? box.spec.type.replace(/^(th2-)/, '') : box.name;
}

export function getImageNameWithoutDomain(imageName: string): string {
	const splitedImageName = imageName.split('/');
	return splitedImageName.slice(-(splitedImageName.length - 1)).join('/');
}

const useStyles = createUseStyles(
	{
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
			gridTemplateAreas: `
				"status type name spacer imageName"
			`,
			gridTemplateRows: '1fr',
			gridTemplateColumns:
				'16px minmax(41px, auto) minmax(100px, max-content) minmax(auto, 1fr) 60px',
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
			minWidth: '100%	',
			lineHeight: '24px',
			fontSize: 12,
			height: '100%',
			textOverflow: 'ellipsis',
			gridArea: 'name',
		},
		bodyValue: {
			lineHeight: '24px',
			fontWeight: 'bold',
			borderRadius: 9,
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			minWidth: '20px',
			height: '100%',
			textOverflow: 'ellipsis',
		},
		type: {
			color: '#fff ',
			backgroundColor: 'rgb(102, 204, 145)',
			borderRadius: 8,
			padding: '0 6px',
			height: '24px',
			width: '41px',
			gridArea: 'type',
		},
		imageName: {
			color: 'rgba(0, 0, 0, 0.5)',
			gridArea: 'imageName',
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
	},
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

	const subscriptionStore = useSubscriptionStore();
	const status = useRef(subscriptionStore.boxStates.get(box.name) || BoxStatus.PENDING);

	const slicedImageName = getImageNameWithoutDomain(box.spec['image-name']);

	return (
		<div
			className={classNames(classes.container, {
				[classes.selectable]: typeof onSelect === 'function',
				[classes.selected]: isSelected,
			})}
			onClick={() => onSelect && onSelect(box)}>
			<div className={classes.header}>
				<Status status={status.current} />
				<span
					style={{ backgroundColor: color }}
					className={classNames(classes.bodyValue, classes.type)}
					title={getBoxType(box)}>
					{getBoxType(box)}
				</span>
				<h5 className={classes.name} title={box.name}>
					{box.name}
				</h5>
				<span className={classNames(classes.bodyValue, classes.imageName)} title={slicedImageName}>
					{slicedImageName}
				</span>
			</div>
		</div>
	);
}

export default Box;

const useStatusStyles = createUseStyles(
	{
		status: {
			height: 16,
			width: 16,
			borderRadius: '50%',
			backgroundColor: '#8b8b8b',
		},
		Running: {
			backgroundColor: '#4CF53D',
		},
		Pending: {
			backgroundColor: '#F5B83D',
		},
		Failed: {
			backgroundColor: '#F53D3D',
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
