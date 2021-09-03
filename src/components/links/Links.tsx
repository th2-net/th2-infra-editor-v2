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

import { observer } from 'mobx-react-lite';
import { createUseStyles } from 'react-jss';
import Box from '../boxes/Box';
import { scrollBar } from '../../styles/mixins';
import BoxConnections from './BoxConnections';
import { useBoxUpdater } from '../../hooks/useBoxUpdater';
import { useBoxesStore } from '../../hooks/useBoxesStore';
import Resizer from '../util/Resizer';
import React from 'react';

const useStyles = createUseStyles({
	container: {
		border: '1px solid',
		gridArea: 'links',
		borderRadius: 6,
		overflow: 'hidden',
		display: 'grid',
		gridTemplateColumns: '1.5fr 1fr 1.5fr',
		height: 'fit-content',
		padding: 5,
		'&>div': {
			flex: 1,
			overflow: 'auto',
			...scrollBar(),
		},
		position: 'relative',
	},
	selectedBox: {
		display: 'grid',
		placeItems: 'center',
		'&>div': {
			height: '100%',
		},
	},
});

function Links() {
	const classes = useStyles();

	const boxesStore = useBoxesStore();
	const boxUpdater = useBoxUpdater();

	const linksRef = React.useRef<HTMLDivElement>(null);
	const [incoming, outgoing] = boxUpdater.selectedBoxConnections;

	const handleResize = (movementY: any) => {
		const links = linksRef.current;
		if (!links) return;
		const { height } = links.getBoundingClientRect();
		links.style.height = `${height + movementY}px`;
	};

	if (!boxesStore.selectedBox) return null;

	return (
		<div className={classes.container} ref={linksRef}>
			<Resizer onResize={handleResize} />
			{incoming && (
				<BoxConnections
					pinConnections={incoming.pins}
					onBoxSelect={boxesStore.selectBox}
					direction='to'
					maxDepth={2}
				/>
			)}
			<div className={classes.selectedBox}>
				<Box box={boxesStore.selectedBox} editableDictionaryRelations={true} />
			</div>
			{outgoing && (
				<BoxConnections
					pinConnections={outgoing.pins}
					onBoxSelect={boxesStore.selectBox}
					direction='from'
					maxDepth={2}
				/>
			)}
		</div>
	);
}

export default observer(Links);
