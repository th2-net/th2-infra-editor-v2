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

import { useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import ConnectedBox from './ConnectedBox';
import { BoxEntity, Pin } from '../../models/Box';
import { Theme } from '../../styles/theme';
import classNames from 'classnames';
import directionIcon from '../../assets/icons/direction-icon.svg';
import { ConnectionDirection } from '../../models/LinksDefinition';
import useSubscriptionStore from '../../hooks/useSubscriptionStore';
import { getHashCode } from '../../helpers/string';

export interface IBoxConnections {
	box: BoxEntity;
	pins: IPinConnections[];
	direction: ConnectionDirection;
}

export interface IPinConnections {
	pin: Pin;
	boxes: IBoxConnections[];
}

const useStyles = createUseStyles((t: Theme) => ({
	group: {
		position: 'relative',
		display: 'grid',
		order: 2,
	},
	list: {
		order: 2,
		'& > div': {
			direction: 'ltr',
		},
		'& > span': {
			direction: 'ltr',
		},
	},
	root: {
		display: 'flex',
		width: 250,
		flexShrink: 0,
	},
	newLink: {
		display: 'block',
		width: '220px',
		height: '35px',
		lineHeight: '30px',
		paddingBottom: '5px',
		textAlign: 'center',
		border: '3px dashed #556f7c',
		background: 'transparent',
		fontWeight: 'bolder',
		color: 'rgb(85,111,124)',
		cursor: 'pointer',
		margin: '5px 27px',
		userSelect: 'none',
		direction: 'initial',
		borderRadius: '7px',
		opacity: '0.5',
		transition: '250ms',
		'&:hover': {
			opacity: '1',
			background: 'rgba(255, 255, 255, 0.4)',
		},
		'&:active': {
			background: 'rgba(255, 255, 255, 0.7)',
		},
	},
}));

interface GroupProps {
	onBoxSelect: (box: BoxEntity) => void;
	editLink: (direction: ConnectionDirection, box?: BoxEntity, pin?: Pin) => void;
	direction: ConnectionDirection;
	pinConnections: IPinConnections[];
	maxDepth?: number;
}

export default function BoxConnections(props: GroupProps) {
	const { onBoxSelect, editLink, direction, pinConnections, maxDepth = 2 } = props;

	const classes = useStyles();

	return (
		<div>
			{pinConnections
				.filter(g => g.boxes.length > 0)
				.map((connection, index) => (
					<div key={index} className={classes.root}>
						<PinConnections
							connections={connection}
							direction={direction}
							onBoxSelect={onBoxSelect}
							isRoot={true}
							maxDepth={maxDepth}
							editLink={box => {
								editLink(direction, box, connection.pin);
							}}
						/>
					</div>
				))}
		</div>
	);
}

interface PinGroupProps {
	onBoxSelect: (box: BoxEntity) => void;
	connections: IPinConnections;
	direction: ConnectionDirection;
	isExpanded?: boolean;
	setIsExpanded?: (isExpanded: boolean) => void;
	isRoot?: boolean;
	maxDepth?: number;
	currentDepth?: number;
	editLink: (box: BoxEntity) => void;
}

const usePinConnectionsClasses = createUseStyles({
	pin: {
		margin: '3px 0',
	},
	boxList: {
		width: '100%',
		flexShrink: 0,
		direction: 'initial',
		fontSize: '14px',
		fontWeight: '500',
	},
	header: {
		display: 'flex',
		color: '#FFF',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: '32px',
		backgroundColor: '#5CBEEF',
		borderRadius: 4,
		padding: '16px 8px',
		direction: 'ltr',
	},
	expandButton: {
		cursor: 'pointer',
		border: 'none',
		borderRadius: '50%',
		width: 20,
		height: 20,
		textAlign: 'center',
		padding: 0,
	},
	arrowIcon: {
		// TODO: embed icon as component
		backgroundImage: `url(${directionIcon})`,
		backgroundSize: '100%',
		placeSelf: 'center',
		width: 25,
		height: 25,
		backgroundRepeat: 'no-repeat',
		order: 1,
		flexShrink: 0,
		gridRow: 1,
		gridColumn: 1,
	},
	editable: {
		cursor: 'pointer',
	},
});

function PinConnections({
	connections,
	direction,
	onBoxSelect,
	isExpanded = true,
	setIsExpanded,
	isRoot = false,
	maxDepth = 2,
	currentDepth = 0,
	editLink,
}: PinGroupProps) {
	const [isExpandedMap, setIsExpandedMap] = useState<Map<string, boolean>>(new Map());

	const subscriptionStore = useSubscriptionStore();

	const classes = usePinConnectionsClasses();

	const hueValue = useMemo(() => {
		const hashCode = getHashCode(connections.pin.name);
		const HUE_SEGMENTS_COUNT = 120;

		return (hashCode % HUE_SEGMENTS_COUNT) * (360 / HUE_SEGMENTS_COUNT);
	}, [connections.pin.name]);

	return (
		<div className={classes.boxList}>
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				{connections.boxes.slice(0, isExpanded ? connections.boxes.length : 1).map((box, index) => (
					<div
						key={box.box.name}
						style={{
							display: 'flex',
							direction: direction === 'to' ? 'rtl' : 'ltr',
							height: '84px',
							marginBottom: 12,
						}}>
						<div style={{ width: 250, flexShrink: 0 }}>
							<div style={{ display: 'grid', gridTemplateColumns: '30px 1fr' }}>
								<div
									className={classes.header}
									style={{
										marginBottom: '4px',
									}}>
									<span className={classes.pin}>{connections.pin.name}</span>
									{!isRoot && connections.boxes.length > 1 && (
										<button
											className={classes.expandButton}
											onClick={() => setIsExpanded && setIsExpanded(!isExpanded)}>
											{isExpanded ? '-' : '+'}
										</button>
									)}
								</div>
								<span
									onClick={() => currentDepth === 0 && editLink(box.box)}
									className={classNames(classes.arrowIcon, {
										[classes.editable]: currentDepth === 0,
									})}
									style={{
										filter: `invert(1) sepia(1) saturate(5) hue-rotate(${hueValue}deg)`,
									}}
								/>
							</div>
							<ConnectedBox
								box={box.box}
								direction={direction}
								onBoxSelect={onBoxSelect}
								status={subscriptionStore.boxStates.get(box.box.name)}
							/>
						</div>
						{currentDepth + 1 < maxDepth && (
							<div>
								{box.pins
									.slice(0, isExpandedMap.get(box.box.name) ? box.pins.length : 1)
									.map((pinsConnection, index) => (
										<PinConnections
											key={index}
											connections={pinsConnection}
											direction={direction}
											onBoxSelect={onBoxSelect}
											isExpanded={!!isExpandedMap.get(box.box.name)}
											setIsExpanded={() => {
												setIsExpandedMap(
													map =>
														new Map([...map, [box.box.name, !isExpandedMap.get(box.box.name)]]),
												);
											}}
											maxDepth={maxDepth}
											currentDepth={currentDepth + 1}
											editLink={editLink}
										/>
									))}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
