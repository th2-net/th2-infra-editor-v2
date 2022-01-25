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
import { scrollBar } from '../../styles/mixins';
import BoxConnections from './BoxConnections';
import { useBoxUpdater } from '../../hooks/useBoxUpdater';
import { useBoxesStore } from '../../hooks/useBoxesStore';
import { useEffect, useMemo, useState } from 'react';
import ConnectionEditor from '../editors/ConnectionEditor';
import { BoxEntity, ExtendedConnectionOwner, Pin } from '../../models/Box';
import SelectedBox from '../resources/SelectedBox';
import { ConnectionDirection, Link } from '../../models/LinksDefinition';
import { chain } from 'lodash';

const useStyles = createUseStyles({
	container: {
		border: '1px solid',
		borderRadius: '6px',
		overflow: 'hidden',
		display: 'grid',
		gridTemplateColumns: '1.5fr 1fr 1.5fr',
		height: '100%',
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

	const [incoming, outgoing] = boxUpdater.selectedBoxConnections;
	const [showEditor, setShowEditor] = useState(false);
	const [linkToEdit, setLinkToEdit] = useState<Link<ExtendedConnectionOwner>>();

	const onSubmit = (value: Link<ExtendedConnectionOwner>) => {
		if (linkToEdit) {
			boxUpdater.changeLink(linkToEdit, value);
		} else {
			boxUpdater.addLink(value);
		}
	};

	const onDelete = () => {
		if (linkToEdit) {
			boxUpdater.deleteLink(linkToEdit).then();
		}
	};

	const onClose = () => setShowEditor(false);

	const openLinkEditor = (
		create: boolean,
		direction: ConnectionDirection,
		box?: BoxEntity,
		pin?: Pin,
	) => {
		if (create) {
			setLinkToEdit(undefined);
			setShowEditor(true);
			return;
		}

		if (!box && !pin) {
			setLinkToEdit({
				name: boxesStore.selectedBox?.name || '',
				[direction]: {
					box: boxesStore.selectedBox?.name,
					pin: '',
				},
			});
			setShowEditor(true);
			return;
		}

		const selectedLink = chain(boxUpdater.links)
			.filter(link => link[direction]?.box === boxesStore.selectedBox?.name)
			.filter(link => link[direction === 'from' ? 'to' : 'from']?.box === box?.name)
			.filter(link => link[direction]?.pin === pin?.name)
			.filter(link => link[direction]?.connectionType === pin?.['connection-type'])
			.head()
			.value();

		setLinkToEdit(selectedLink);
		setShowEditor(true);
	};

	const color = useMemo(() => {
		return boxesStore.groupsConfig.find(group =>
			group.types.includes(boxesStore?.selectedBox?.spec.type ?? ''),
		)?.color;
	}, [boxesStore.groupsConfig, boxesStore?.selectedBox?.spec.type]);

	useEffect(() => {
		setShowEditor(false);
	}, [boxesStore.selectedBox]);

	if (!boxesStore.selectedBox) return null;

	return (
		<div className={classes.container}>
			{incoming && (
				<BoxConnections
					pinConnections={incoming.pins}
					onBoxSelect={boxesStore.selectBox}
					direction='to'
					maxDepth={2}
					editLink={(direction, box, pin) => openLinkEditor(false, direction, box, pin)}
				/>
			)}
			<div className={classes.selectedBox}>
				{showEditor ? (
					<ConnectionEditor
						editableLink={linkToEdit}
						onSubmit={onSubmit}
						onDelete={onDelete}
						onClose={onClose}
					/>
				) : (
					<SelectedBox
						box={boxesStore.selectedBox}
						createNewLink={() => openLinkEditor(true, 'from')}
						color={color}
					/>
				)}
			</div>
			{outgoing && (
				<BoxConnections
					pinConnections={outgoing.pins}
					onBoxSelect={boxesStore.selectBox}
					direction='from'
					maxDepth={2}
					editLink={(direction, box, pin) => openLinkEditor(false, direction, box, pin)}
				/>
			)}
		</div>
	);
}

export default observer(Links);
