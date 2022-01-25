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

import { useCallback, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { ExtendedConnectionOwner, isBoxEntity, Pin } from '../../models/Box';
import { Theme } from '../../styles/theme';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useBoxesStore } from '../../hooks/useBoxesStore';
import { ConnectionDirection, Link } from '../../models/LinksDefinition';
import { button, scrollBar } from '../../styles/mixins';
import ConnectionConfig from './ConnectionConfig';
import { chain } from 'lodash';
import { useBoxUpdater } from '../../hooks/useBoxUpdater';
import closeIcon from '../../assets/icons/close-icon.svg';
import swapButton from '../../assets/icons/swap-button.svg';

const useStyles = createUseStyles((t: Theme) => ({
	editor: {
		borderRadius: 4,
		background: '#fff',
		border: 'none',
		boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.12)',
		direction: 'ltr',
		boxSizing: 'border-box',
		height: 'fit-content',
		width: '496px',
		position: 'absolute',
		overflow: 'hidden',
		display: 'grid',
		gridTemplateRows: '40px 1fr',
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: '16px 8px',
		backgroundColor: '#E5E5E5',
	},
	title: {
		cursor: 'default',
	},
	closeButton: {
		cursor: 'pointer',
		height: '12px',
		width: '12px',
		userSelect: 'none',
		backgroundImage: `url(${closeIcon})`,
		'&:hover': {
			backgroundColor: 'rgba(0, 0, 0, 0.05)',
		},
		'&:active': {
			backgroundColor: 'rgba(0, 0, 0, 0.1)',
		},
	},
	content: {
		...scrollBar(),
		padding: 24,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',

		width: '100%',
	},
	actions: {
		marginTop: 16,
		gap: 12,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
	},
	button: {
		...button(),
	},
	submit: {
		background: '#5CBEEF',
		'&:hover': {
			background: '#EEF2F6',
			color: 'rgba(51, 51, 51, 0.8)',
		},
		'&:active': {
			background: '#0099E5',
			color: '#FFF',
		},
	},
	deleteButton: {
		background: '#4E4E4E',
		'&:hover': {
			background: '#EEF2F6',
			color: 'rgba(51, 51, 51, 0.8)',
		},
		'&:active': {
			background: '#0099E5',
			color: '#FFF',
		},
	},
	disabled: {
		background: '#5CBEEF',
		opacity: 0.4,
		cursor: 'not-allowed',
	},
	swapButton: {
		display: 'block',
		height: '24px',
		width: '24px',
		margin: 16,
		cursor: 'pointer',
		backgroundImage: `url(${swapButton})`,
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
	const boxUpdater = useBoxUpdater();
	const selectedBox = boxesStore.selectedBox;

	const [link, setLink] = useState<Link<ExtendedConnectionOwner>>(
		editableLink
			? editableLink
			: {
					name: selectedBox?.name ?? '',
					from: {
						box: selectedBox?.name || '',
						pin: '',
						connectionType: 'grpc',
					},
			  },
	);

	const cancelOrDelete = () => {
		if (editableLink) {
			onDelete();
		}
		onClose();
	};

	const direction: ConnectionDirection = useMemo(
		() => (selectedBox?.name === link?.to?.box ? 'to' : 'from'),
		[link?.to?.box, selectedBox?.name],
	);

	const isExistBox = useCallback(
		(box: string) => {
			return boxesStore.boxes.filter(item => item.name === box).length !== 0;
		},
		[boxesStore.boxes],
	);

	const getAutocompleteByOwner = useCallback(
		(owner?: ExtendedConnectionOwner): string[] => {
			if (!owner || !isExistBox(owner.box)) {
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
				.filter(
					box =>
						(box.spec?.pins || []).filter(box => box['connection-type'] === pin['connection-type'])
							.length > 0,
				)
				.map(box => box.name)
				.value();
		},
		[boxesStore.boxes, isExistBox],
	);

	const swap = () => {
		setLink({
			name: link.name,
			from: link.to,
			to: link.from,
		});
	};

	const setOwner = (owner: ExtendedConnectionOwner, direction: ConnectionDirection) => {
		setLink({
			name: link.name,
			from: direction === 'from' ? owner : link.from,
			to: direction === 'to' ? owner : link.to,
		});
	};

	const linkName = useMemo(
		() => `${link?.from?.box || '...'}-to-${link?.to?.box || '...'} `,
		[link?.from?.box, link?.to?.box],
	);

	const isSubmitDisabled = useMemo(() => {
		if (!link.to || !link.from) {
			return true;
		}

		return (
			chain(boxUpdater.links)
				.filter(item => item.to?.box === link.to?.box && item.from?.box === link.from?.box)
				.filter(item => item.to?.pin === link.to?.pin && item.from?.pin === link.from?.pin)
				.value().length > 0
		);
	}, [boxUpdater.links, link.from, link.to]);

	const submit = () => {
		if (isSubmitDisabled) {
			return;
		}
		onSubmit({
			name: linkName,
			from: link.from,
			to: link.to,
		});
		onClose();
	};

	const submitButtonClassName = classNames(
		classes.button,
		isSubmitDisabled ? classes.disabled : classes.submit,
	);

	return (
		<div className={classes.editor}>
			<div className={classes.header}>
				<span className={classes.title}>Link Config</span>
				<span className={classes.closeButton} onClick={() => onClose()}></span>
			</div>
			<div className={classes.content}>
				<ConnectionConfig
					label='from'
					id='boxFrom'
					owner={link.from}
					setOwner={owner => setOwner(owner, 'from')}
					autocomplete={boxesStore.boxes.map(box => box.name)}
					disabled={direction === 'from' && editableLink !== undefined}
					isBoxFieldDisabled={direction === 'from' && editableLink === undefined}
				/>
				<span className={classes.swapButton} onClick={swap}></span>
				<ConnectionConfig
					label='to'
					id='boxTo'
					owner={link.to}
					setOwner={owner => setOwner(owner, 'to')}
					autocomplete={getAutocompleteByOwner(link.from)}
					disabled={direction === 'to' && editableLink !== undefined}
					isBoxFieldDisabled={direction === 'to' && editableLink === undefined}
				/>
				<div className={classes.actions}>
					<button
						onClick={cancelOrDelete}
						className={classNames(classes.button, classes.deleteButton)}>
						{editableLink ? 'Delete' : 'Cancel'}
					</button>
					<button onClick={submit} className={submitButtonClassName}>
						Submit
					</button>
				</div>
			</div>
		</div>
	);
}

export default observer(ConnectionEditor);
