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

import { useCallback, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { ExtendedConnectionOwner, isBoxEntity, Pin } from '../../models/Box';
import { Theme } from '../../styles/theme';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useBoxesStore } from '../../hooks/useBoxesStore';
import { Link } from '../../models/LinksDefinition';
import { button } from '../../styles/mixins';
import ConnectionConfig from './ConnectionConfig';
import { computed } from 'mobx';
import { chain } from 'lodash';

const useStyles = createUseStyles((t: Theme) => ({
	editor: {
		borderRadius: '10px',
		background: '#fff',
		border: '1px solid #eee',
		direction: 'ltr',
		boxSizing: 'border-box',
		height: '100%',
		width: '100%',
		position: 'relative',
		overflow: 'hidden',
		display: 'grid',
		gridTemplateRows: '36px 1fr 36px',
		gridTemplateColumns: '1fr',
	},
	header: {
		display: 'grid',
		gridTemplateAreas: '"title linkName close"',
		gridTemplateColumn: 'minmax(30px, max-content) minmax(30px, 100px) 25px',
		gridTemplateRows: '1fr',
		gap: '10px',
		padding: '7px 15px',
		borderRadius: '10px 10px 0 0',
		background: 'rgba(0, 0, 0, 0.05)',
	},
	title: {
		cursor: 'default',
		gridArea: 'title',
	},
	linkName: {
		color: 'rgba(0, 0, 0, 0.55)',
		gridArea: 'linkName',
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
	},
	close: {
		gridArea: 'close',
		borderRadius: '50%',
		cursor: 'pointer',
		height: '25px',
		width: '25px',
		display: 'inline-block',
		lineHeight: '25px',
		textAlign: 'center',
		userSelect: 'none',
		'&:hover': {
			background: 'rgba(0, 0, 0, 0.05)',
		},
		'&:active': {
			background: 'rgba(0, 0, 0, 0.1)',
		},
	},
	content: {
		padding: '7px',
		display: 'grid',
		gridTemplateColumns: '1fr',
		gridTemplateRows: 'repeat(auto-fit, minmax(30px, max-content))',
		height: 'auto',
		width: '100%',
		overflow: 'auto',
		paddingTop: '15px',
	},
	actions: {
		width: '100%',
		height: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
	},
	button: {
		...button(),
	},
	submit: {
		background: '#ffa666',
		'&:hover': {
			background: '#ffb37c',
		},
		'&:active': {
			background: '#ffc093',
		},
	},
	delete: {
		background: '#ff6666',
		'&:hover': {
			background: '#ff7c7c',
		},
		'&:active': {
			background: '#ff9393',
		},
	},
	disabled: {
		background: '#7c7c7c',
		cursor: 'not-allowed',
	},
	swap: {
		display: 'block',
		height: '25px',
		lineHeight: '20px',
		width: '25px',
		fontSize: '18px',
		textAlign: 'center',
		boxSizing: 'border-box',
		color: 'rgba(0, 0, 0, 0.6)',
		border: '1px solid rgba(0, 0, 0, 0.25)',
		borderRadius: '50%',
		padding: '2px',
		margin: '3px auto',
		cursor: 'pointer',
		boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
		backgroundColor: '#fff',
		transition: '250ms',
		userSelect: 'none',
		'&:hover': {
			color: 'rgba(0, 0, 0, 0.8)',
			backgroundColor: 'rgba(0, 0, 0, 0.05)',
		},
		'&:active': {
			color: 'rgba(0, 0, 0, 0.9)',
			backgroundColor: 'rgba(0, 0, 0, 0.1)',
		},
	},
}));


interface ConnectionsEditorProps {
	editableLink?: Link<ExtendedConnectionOwner>;
	onSubmit: (value: Link<ExtendedConnectionOwner>) => void;
	onDelete: () => void;
	onClose: () => void;
}

function ConnectionEditor(props: ConnectionsEditorProps) {
	const { editableLink, onSubmit, onDelete, onClose } = props;

	const classes = useStyles();

	const boxesStore = useBoxesStore();
	const selectedBox = boxesStore.selectedBox;

	const ref = useRef<HTMLDivElement>(null);
	const [link, setLink] = useState<Link<ExtendedConnectionOwner>>(editableLink ? editableLink : {
		name: selectedBox?.name ?? '', from: {
			box: selectedBox?.name || '',
			pin: '',
			connectionType: 'grpc',
		},
	});

	const cancelOrDelete = () => {
		if (editableLink) {
			onDelete();
		}
		onClose();
	};

	const direction: 'to' | 'from' = computed(() => selectedBox?.name === link?.to?.box ? 'to' : 'from').get();

	const getAutocompleteByOwner = useCallback((owner?: ExtendedConnectionOwner): string[] => {
		if (!owner || boxesStore.boxes.filter(item => item.name === owner.box).length === 0) {
			return [];
		}

		const pin: Pin = chain(boxesStore.boxes)
			.filter(box => box.name === owner.box)
			.uniqBy('name')
			.filter(isBoxEntity)
			.map(box => box.spec?.pins || [])
			.flatten()
			.filter(pin => pin.name === owner.pin)
			.head()
			.value();

		if (!pin) {
			return [];
		}

		return chain(boxesStore.boxes)
			.filter(box => (box.spec?.pins || [])
				.filter(box => box['connection-type'] === pin['connection-type']).length > 0)
			.map(box => box.name)
			.value();
	}, [boxesStore.boxes]);

	const swap = () => {
		setLink({
			name: link.name,
			from: link.to,
			to: link.from,
		});
	};

	const setOwner = (owner: ExtendedConnectionOwner, direction: 'to' | 'from') => {
		setLink(
			{
				name: link.name,
				from: direction === 'from' ? owner : link.from,
				to: direction === 'to' ? owner : link.to,
			},
		);
	};

	const linkName = computed(() => `${link?.from?.box || '...'}-to-${link?.to?.box || '...'} `).get();

	const submit = () => {
		if (!link.to || !link.from) {
			return;
		}
		onSubmit({
			name: linkName,
			from: link.from,
			to: link.to,
		});
		onClose();
	};

	return (
		<div ref={ref} className={classes.editor}>
			<div className={classes.header}>
				<span className={classes.title}>{editableLink ? 'Edit' : 'New link'}</span>
				<span title={link?.name} className={classes.linkName}>{`(${linkName})`}</span>
				<span className={classes.close} onClick={() => onClose()}>&#10006;</span>
			</div>

			<div className={classes.content}>
				<ConnectionConfig label='from' id='boxFrom' owner={link.from} setOwner={(owner) => setOwner(owner, 'from')}
													autocomplete={boxesStore.boxes.map(box => box.name)}
													disabled={direction === 'from' ? (editableLink ? 'all' : 'box') : 'none'}
													isSelected={direction === 'from'} />
				<span className={classes.swap} onClick={swap}>&#8645;</span>
				<ConnectionConfig label='to' id='boxTo' owner={link.to} setOwner={(owner) => setOwner(owner, 'to')}
													autocomplete={getAutocompleteByOwner(link.from)}
													disabled={direction === 'to' ? (editableLink ? 'all' : 'box') : 'none'}
													isSelected={direction === 'to'} />
			</div>

			<div className={classes.actions}>
				<button onClick={cancelOrDelete}
								className={classNames(classes.button, classes.delete)}>{editableLink ? 'Delete' : 'Cancel'}</button>
				<button onClick={submit} className={classNames(classes.button, {
					[classes.submit]: link.to && link.from,
					[classes.disabled]: !link.to || !link.from,
				})}>Submit
				</button>
			</div>
		</div>
	);
}

export default observer(ConnectionEditor);