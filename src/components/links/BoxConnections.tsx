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

import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import ConnectedBox from './ConnectedBox';
import { BoxEntity, Pin } from '../../models/Box';
import { Theme } from '../../styles/theme';
import { ConnectionDirection } from '../../models/LinksDefinition';
import useSubscriptionStore from '../../hooks/useSubscriptionStore';

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
		<div style={{ direction: direction === 'to' ? 'rtl' : 'initial' }}>
			<div className={classes.newLink} onClick={() => editLink(direction)}>
				New link +
			</div>
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
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		direction: 'ltr',
		'&~div': {
			height: 'calc(100% - 24px)',
		},
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

	return (
		<div className={classes.boxList}>
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				{connections.boxes.slice(0, isExpanded ? connections.boxes.length : 1).map((box, index) => (
					<div
						key={box.box.name}
						style={{
							display: 'flex',
							direction: direction === 'to' ? 'rtl' : 'ltr',
							marginBottom: 5,
						}}
					>
						<div style={{ width: 250, flexShrink: 0 }}>
							{index === 0 && (
								<div
									className={classes.header}
									style={{
										padding: direction === 'to' ? '0 30px 0 0' : '0 0 0 30px',
									}}
								>
									<span className={classes.pin}>{connections.pin.name}</span>
									{!isRoot && connections.boxes.length > 1 && (
										<button
											className={classes.expandButton}
											onClick={() => setIsExpanded && setIsExpanded(!isExpanded)}
										>
											{isExpanded ? '-' : '+'}
										</button>
									)}
								</div>
							)}
							<ConnectedBox
								box={box.box}
								pin={connections.pin}
								direction={direction}
								onBoxSelect={onBoxSelect}
								isEditable={currentDepth === 0}
								onClickLink={() => editLink(box.box)}
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
