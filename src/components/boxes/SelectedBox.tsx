/** *****************************************************************************
 * Copyright 2020-2021 Exactpro (Exactpro Systems Limited)
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

import { useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';
import { BoxEntity, BoxStatus } from '../../models/Box';
import { Theme } from '../../styles/theme';
import DictionaryLinksEditor from '../editors/DictionaryLinksEditor';
import { getBoxType, getImageNameWithoutDomain, Status } from './Box';
import { button, scrollBar } from '../../styles/mixins';
import { useState } from 'react';

interface StylesProps {
	headerBgColor?: string;
}

const useStyles = createUseStyles<string, StylesProps, Theme>(
	theme => ({
		container: {
			width: '100%',
			backgroundColor: '#fff',
			minHeight: 70,
			borderRadius: 4,
			boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.12)',
			overflow: 'hidden',
			display: 'grid',
			gridTemplateRows: '25px 1fr',
		},
		header: {
			height: 25,
			width: '100%',
			display: 'flex',
			alignItems: 'center',
			padding: '0 10px',
			backgroundColor: ({ headerBgColor }) => headerBgColor ?? 'rgb(102, 204, 145)',
			color: '#fff',
		},
		name: {
			margin: '0 0 0 5px',
			fontSize: 12,
		},
		body: {
			...scrollBar(),
			height: '100%',
			padding: '20px',
			display: 'grid',
			gridTemplateRows: 'auto 1fr auto',
		},
		info: {
			width: '100%',
			display: 'flex',
			justifyContent: 'space-between',
			height: 'fit-content',
		},
		actions: {
			display: 'flex',
			gap: 24,
			justifyContent: 'center',
		},
		bodyValue: {
			fontSize: '12px',
			fontWeight: 'bold',
			borderRadius: 9,
			padding: '4px 8px',
			height: 'fit-content',
		},
		type: {
			color: '#fff',
			flexShrink: 0,
			backgroundColor: ({ headerBgColor }) => headerBgColor ?? 'rgb(102, 204, 145)',
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
		addLink: {
			...button(),
			backgroundColor: '#5CBEEF',
			'&:hover': {
				backgroundColor: '#EEF2F6',
				color: 'rgba(51, 51, 51, 0.8)',
			},
			'&:active': {
				backgroundColor: '#0099E5',
				color: '#FFF',
			},
		},
		addDictionary: {
			...button(),
			backgroundColor: '#4E4E4E',
			'&:hover': {
				backgroundColor: '#EEF2F6',
				color: 'rgba(51, 51, 51, 0.8)',
			},
			'&:active': {
				backgroundColor: '#0099E5',
				color: '#FFF',
			},
		},
	}),
	{ name: 'SelectedBox' },
);

interface Props {
	box: BoxEntity;
	createNewLink: () => void;
	color?: string;
}

function SelectedBox(props: Props) {
	const { box, createNewLink, color } = props;
	const classes = useStyles({ headerBgColor: color });

	const [showAddDictionary, setShowAddDictionary] = useState(false);

	// TODO: fix status
	const status = useMemo(() => Object.values(BoxStatus)[box.name.length % 2], [box.name.length]);

	const slicedImageName = getImageNameWithoutDomain(box.spec['image-name']);

	return (
		<div className={classes.container}>
			<div className={classes.header}>
				<Status status={status} />
				<h5 className={classes.name}>{box.name}</h5>
			</div>
			<div className={classes.body}>
				<div className={classes.info}>
					<span className={classNames(classes.bodyValue, classes.type)}>{getBoxType(box)}</span>
					<span className={classes.bodyValue}>{slicedImageName}</span>
				</div>
				<DictionaryLinksEditor
					showAddDictionary={showAddDictionary}
					setShowAddDictionary={setShowAddDictionary}
				/>
				<div className={classes.actions}>
					<button className={classes.addLink} onClick={createNewLink}>
						Add link
					</button>
					<button className={classes.addDictionary} onClick={() => setShowAddDictionary(true)}>
						Add Dictionary
					</button>
				</div>
			</div>
		</div>
	);
}

export default SelectedBox;
