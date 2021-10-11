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

export function getBoxType(box: BoxEntity) {
	return box.spec.type ? box.spec.type.replace(/^(th2-)/, '') : box.name;
}

export function getImageNameWithoutDomain(imageName: string): string {
	const splitedImageName = imageName.split('/');
	return splitedImageName.slice(-(splitedImageName.length - 1)).join('/');
}

interface StylesProps {
	boxBodySpacing: number;
}

const useStyles = createUseStyles<string, StylesProps>(
	{
		container: {
			width: '100%',
			backgroundColor: '#fff',
			minHeight: 25,
			borderRadius: 6,
			overflow: 'hidden',
			display: 'grid',
			gridTemplateRows: '23px auto',
			cursor: 'pointer',
			boxSizing: 'border-box',
			padding: '1px',
		},
		header: {
			height: 23,
			width: '100%',
			maxHeight: 23,
			display: 'grid',
			alignItems: 'center',
			gridTemplateAreas: `
				"status type name spacer imageName"
			`,
			gridTemplateRows: '1fr',
			gridTemplateColumns:
				'11px minmax(30px, auto) minmax(100px, max-content) minmax(auto, 1fr) minmax(50px, max-content)',
			justifyContent: 'start',
			padding: '0 10px',
			backgroundColor: '#fff',
			color: '#000',
			gap: 5,
		},
		name: {
			margin: '0 0 0 5px',
			fontSize: 12,
			textAlign: 'left',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			minWidth: '100%	',
			lineHeight: '23px',
			height: '100%',
			textOverflow: 'ellipsis',
			gridArea: 'name',
		},
		body: {
			height: '100%',
			padding: props => `${props.boxBodySpacing}px`,
		},
		bodyValue: {
			fontSize: '12px',
			lineHeight: '23px',
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
			borderRadius: '10px',
			padding: '0 6px',
			height: '20px',
			maxWidth: '80px',
			lineHeight: '20px',
			gridArea: 'type',
		},
		imageName: {
			color: 'rgba(0, 0, 0, 0.5)',
			gridArea: 'imageName',
		},
		selectable: {
			cursor: 'pointer',
			'&:hover': {
				border: '1px solid',
				padding: '0',
			},
		},
		selected: {
			border: '1px solid',
			padding: '0',
		},
	},
	{ name: 'Box' },
);

interface Props {
	box: BoxEntity;
	editableDictionaryRelations?: boolean;
	color?: string;
	onSelect?: (box: BoxEntity) => void;
	isSelected?: boolean;
}

function Box(props: Props) {
	const { box, color, onSelect, editableDictionaryRelations, isSelected = false } = props;

	const stylesProps = computed(() => {
		return { boxBodySpacing: editableDictionaryRelations ? 20 : 0 };
	}).get();

	const classes = useStyles(stylesProps);

	// TODO: fix status
	const status = useRef(Object.values(BoxStatus)[box.name.length % 2]);

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
			<div className={classes.body}>{editableDictionaryRelations && <DictionaryLinksEditor />}</div>
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
			border: '1px solid #777',
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
