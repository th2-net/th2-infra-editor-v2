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
import { getBoxType, Status } from '../resources/Box';
import { BoxEntity, BoxStatus } from '../../models/Box';
import { ellipsis } from '../../styles/mixins';
import directionIcon from '../../assets/icons/direction-icon.svg';
import { ConnectionDirection } from '../../models/LinksDefinition';

const useConnectionBoxStyles = createUseStyles({
	headerBackground: {
		backgroundColor: '#5CBEEF',
		padding: '8px',
		borderRadius: 4,
	},
	header: {
		borderRadius: 4,
		minWidth: 100,
		width: '100%',
		height: '32px',
		flexShrink: 0,
		padding: '4px',
		backgroundColor: '#fff',
		direction: 'ltr',
		display: 'grid',
		gridTemplateColumns: '16px 1fr',
		alignItems: 'center',
		cursor: 'pointer',
	},
	name: {
		margin: '0 0 0 5px',
		fontSize: 12,
		whiteSpace: 'nowrap',
		flexGrow: 1,
		flexShrink: 0,
		marginRight: 8,
		lineHeight: '16px',
		...ellipsis(),
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
	box: {
		direction: 'rtl',
		height: '48px',
	},
	type: {
		textAlign: 'center',
		fontSize: 11,
		fontWeight: 'bold',
		height: '24px',
		borderRadius: 8,
		padding: '0 4px 2px',
		color: '#fff',
		backgroundColor: 'rgb(102, 204, 145)',
		width: '41px',
		lineHeight: '24px',
		...ellipsis(),
	},
	values: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		overflow: 'hidden',
	},
});

interface ConnectionBoxProps {
	box: BoxEntity;
	direction: ConnectionDirection;
	onBoxSelect: (box: BoxEntity) => void;
	status?: BoxStatus;
}

export default function ConnectedBox({ box, direction, onBoxSelect, status }: ConnectionBoxProps) {
	const classes = useConnectionBoxStyles();

	function handleBoxClick() {
		onBoxSelect(box);
	}

	const type = getBoxType(box);

	return (
		<div
			className={classes.box}
			style={{
				direction: direction === 'to' ? 'rtl' : 'ltr',
				margin: direction === 'to' ? '0 30px 0 0' : '0 0 0 30px',
			}}>
			<div className={classes.headerBackground}>
				<div className={classes.header} onClick={handleBoxClick}>
					<Status status={status ?? BoxStatus.PENDING} />
					<div className={classes.values}>
						<span className={classes.name} title={box.name}>
							{box.name}
						</span>
						<span className={classes.type} title={type}>
							{type}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
