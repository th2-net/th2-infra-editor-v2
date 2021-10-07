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

import { useMemo, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { getBoxType, Status } from '../boxes/Box';
import { BoxEntity, BoxStatus, Pin } from '../../models/Box';
import { getHashCode } from '../../helpers/string';
import { ellipsis } from '../../styles/mixins';
import directionIcon from '../../assets/icons/direction-icon.svg';
import classNames from 'classnames';
import { ConnectionDirection } from '../../models/LinksDefinition';

const useConnectionBoxStyles = createUseStyles({
	header: {
		minWidth: 100,
		width: '100%',
		height: '100%',
		minHeight: 25,
		flexShrink: 0,
		padding: '0 6px',
		backgroundColor: '#fff',
		borderRadius: 6,
		direction: 'ltr',
		display: 'grid',
		gridTemplateColumns: '13px 1fr',
		alignItems: 'center',
		cursor: 'pointer',
		boxShadow: '0 2px 5px rgb(0 0 0 / 25%)',
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
		display: 'grid',
		gridTemplateColumns: '30px 1fr',
		direction: 'rtl',
		height: '100%',
	},
	type: {
		textAlign: 'center',
		fontSize: 11,
		fontWeight: 'bold',
		borderRadius: 9,
		padding: '0 4px 2px',
		color: '#fff',
		backgroundColor: 'rgb(102, 204, 145)',
		minWidth: 30,
		lineHeight: '16px',
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
	pin: Pin;
	onBoxSelect: (box: BoxEntity) => void;
	isEditable: boolean;
	onClickLink: () => void;
	status?: BoxStatus;
}

export default function ConnectedBox({
	box,
	direction,
	pin,
	onBoxSelect,
	onClickLink,
	isEditable,
	status,
}: ConnectionBoxProps) {
	const classes = useConnectionBoxStyles();

	const hueValue = useMemo(() => {
		const hashCode = getHashCode(pin.name);
		const HUE_SEGMENTS_COUNT = 120;

		return (hashCode % HUE_SEGMENTS_COUNT) * (360 / HUE_SEGMENTS_COUNT);
	}, [pin.name]);

	function handleBoxClick() {
		onBoxSelect(box);
	}

	const type = getBoxType(box);

	return (
		<div className={classes.box} style={{ direction: direction === 'to' ? 'rtl' : 'ltr' }}>
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
			<span
				onClick={() => isEditable && onClickLink()}
				className={classNames(classes.arrowIcon, {
					[classes.editable]: isEditable,
				})}
				style={{
					filter: `invert(1) sepia(1) saturate(5) hue-rotate(${hueValue}deg)`,
				}}
			/>
		</div>
	);
}
