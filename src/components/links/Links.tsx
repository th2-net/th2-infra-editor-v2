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

import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { createUseStyles } from 'react-jss';
import { chain, Dictionary, keyBy, mapValues, sortBy, uniqBy } from 'lodash';
import { useSchemaStore } from '../../hooks/useSchemaStore';
import Box from '../boxes/Box';
import { BoxEntity, ExtendedConnectionOwner, isBoxEntity } from '../../models/Box';
import { Link } from '../../models/LinksDefinition';
import { scrollBar } from '../../styles/mixins';
import BoxConnections, { IBoxConnections, IPinConnections } from './BoxConnections';
import { DictionaryRelation } from '../../models/Dictionary';

const useStyles = createUseStyles({
	container: {
		border: '1px solid',
		gridArea: 'links',
		borderRadius: 6,
		overflow: 'hidden',
		display: 'grid',
		gridTemplateColumns: '1.5fr 1fr 1.5fr',
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

	const schemaStore = useSchemaStore();

	function resolveBoxLinks(
		box: BoxEntity,
		boxesMap: Dictionary<BoxEntity>,
		links: Link<ExtendedConnectionOwner>[],
		direction: 'to' | 'from',
		depth = 2,
		currentDepth = 0,
	): IBoxConnections {
		const oppositeDirection = direction === 'to' ? 'from' : 'to';
		const connectedLinks = links.filter(
			link => link[direction].box === box.name && boxesMap[link[oppositeDirection].box],
		);
		const connectedPins = connectedLinks.map(link => link[direction].pin);
		const pins = (box.spec.pins || []).filter(pin => connectedPins.includes(pin.name));

		let boxes: IPinConnections[] =
			currentDepth === depth
				? []
				: pins.map(pin => ({
						pin,
						boxes: chain(connectedLinks)
							.filter(link => link[direction].pin === pin.name)
							.map(link => boxesMap[link[oppositeDirection].box])
							.uniqBy('name')
							.filter(isBoxEntity)
							.sortBy('name')
							.map(box => resolveBoxLinks(box, boxesMap, links, direction, depth, currentDepth + 1))
							.value(),
				  }));

		boxes = boxes.reduce((acc, curr) => {
			const pin = acc.find(b => b.pin.name === curr.pin.name);
			if (pin) {
				pin.boxes = uniqBy([...pin.boxes, ...curr.boxes], 'name');
				return acc;
			}
			return [...acc, curr];
		}, [] as IPinConnections[]);

		const boxLinks: IBoxConnections = {
			box,
			direction,
			pins: sortBy(boxes, 'pin.name').filter(pinConnections => pinConnections.boxes.length > 0),
		};

		return boxLinks;
	}

	const [incoming, outgoing] = useMemo(() => {
		const selectedBox = schemaStore.selectedBox;

		if (selectedBox) {
			const boxesMap = mapValues(keyBy(schemaStore.boxes, 'name'));

			return [
				resolveBoxLinks(selectedBox, boxesMap, schemaStore.links, 'to', 2),
				resolveBoxLinks(selectedBox, boxesMap, schemaStore.links, 'from', 2),
			];
		}

		return [null, null];
	}, [schemaStore.selectedBox, schemaStore.links, schemaStore.boxes]);

	const linkDictionaries: DictionaryRelation[] = useMemo(
		() => schemaStore.linkDictionaries
			.filter(rel => rel?.box === schemaStore.selectedBox?.name),
		[schemaStore.linkDictionaries, schemaStore.selectedBox]
	);	

	if (!schemaStore.selectedBox) return null;

	return (
		<div className={classes.container}>
			{incoming && (
				<BoxConnections
					pinConnections={incoming.pins}
					onBoxSelect={schemaStore.selectBox}
					direction='to'
					maxDepth={2}
				/>
			)}
			<div className={classes.selectedBox}>
				<Box box={schemaStore.selectedBox} linkDictionaries={linkDictionaries}/>
			</div>
			{outgoing && (
				<BoxConnections
					pinConnections={outgoing.pins}
					onBoxSelect={schemaStore.selectBox}
					direction='from'
					maxDepth={2}
				/>
			)}
		</div>
	);
}

export default observer(Links);
