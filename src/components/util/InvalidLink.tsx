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
import { useSchemaStore } from '../../hooks/useSchemaStore';
import { BoxEntity } from '../../models/Box';
import Box from '../resources/Box';

const useStyles = createUseStyles({
	clicableLink: {
		textDecoration: 'underline',
		cursor: 'pointer',
		color: 'blue',
		'&:hover': {
			color: 'red',
		},
	},
	boxCardContainer: {
		borderRadius: 7,
		backgroundColor: 'lightgray',
		padding: 3,
		width: 295,
		height: 31,
		marginTop: 5,
		marginBottom: 5,
	},
	invalidLinksUl: {
		listStyleType: 'decimal',
		'& li': {
			marginBottom: 10,
		},
	},
});

function BoxCard(props: { box: BoxEntity | undefined; boxName: string }) {
	const classes = useStyles();
	const { boxesStore } = useSchemaStore();
	if (props.box !== undefined) {
		const group = boxesStore.groupsConfig.find(group =>
			group.types.includes((props.box as BoxEntity).spec.type),
		);
		return (
			<div className={classes.boxCardContainer}>
				<Box
					box={props.box}
					color={group?.color}
					onSelect={box => {
						boxesStore.selectBox(null, box.name);
					}}
				/>
			</div>
		);
	} else {
		return <b>{props.boxName}</b>;
	}
}

export function InvalidLinkItems() {
	const classes = useStyles();
	const { invalidLinks, boxesStore } = useSchemaStore();
	return (
		<ul className={classes.invalidLinksUl}>
			{invalidLinks.map(link =>
				link.lostPins.map(pin => (
					<li>
						pin <b>{pin.pin}</b> not found in box{' '}
						<BoxCard box={boxesStore.boxes.find(box => box.name === pin.box)} boxName={pin.box} />{' '}
						in link <b>{link.link.name}</b>
					</li>
				)),
			)}
			{invalidLinks.map(link =>
				link.lostBoxes.map(box => (
					<li>
						box <b>{box.box}</b> not found in link <b>{link.link.name}</b>
					</li>
				)),
			)}
		</ul>
	);
}
