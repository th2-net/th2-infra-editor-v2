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
import { useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useBoxesStore } from '../../hooks/useBoxesStore';
import { useDictionaryLinksStore } from '../../hooks/useDictionaryLinksStore';
import { DictionaryRelation } from '../../models/Dictionary';
import Icon from '../Icon';
import { ModalPortal } from '../util/Portal';
import closeIcon from '../../assets/icons/close-icon.svg';
import { button, scrollBar } from '../../styles/mixins';
import classNames from 'classnames';

const useLinkStyle = createUseStyles({
	link: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	title: {
		width: '150px',
		backgroundColor: '#EEF2F6',
		borderRadius: 4,
		display: 'grid',
		gridTemplateColumns: 'auto 1fr auto',
		gap: 14,
		padding: '8px 10px',
		fontWeight: 600,
		alignItems: 'center',
	},
	name: {
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
		overflow: 'hidden',
	},
	delete: {
		display: 'inline-flex',
		padding: '0 2px',
		verticalAlign: 'middle',
		backgroundColor: 'transparent',
		outline: 'none',
		border: 'none',
		cursor: 'pointer',
		'&:hover': {
			backgroundColor: '#e5e5e5',
		},
	},
});

interface DictionaryLinkProps {
	link: DictionaryRelation;
	deleteLink: () => void;
}

const Link = ({ link, deleteLink }: DictionaryLinkProps) => {
	const classes = useLinkStyle();
	return (
		<div className={classes.link}>
			<div className={classes.title}>
				<Icon id='dictionary' stroke='black' fill='#333' />
				<div className={classes.name}>{link.dictionary.name}</div>
				<button className={classes.delete} onClick={deleteLink}>
					<Icon id='cross' stroke='black' />
				</button>
			</div>
		</div>
	);
};

export const useLinksStyles = createUseStyles({
	links: {
		width: '100%',
		fontSize: 12,
		color: '#666666',
		fontWeight: 400,
	},
	add: {
		cursor: 'pointer',
		backgroundColor: 'transparent',
		margin: '10px 0 0',
		border: '1px grey solid',
		outline: 'none',
		borderRadius: '50%',
		padding: 0,
		width: 24,
		height: 24,
		'&:hover': {
			backgroundColor: '#e5e5e5',
		},
	},
	editor: {
		display: 'grid',
		gridTemplateRows: 'auto 1fr auto',
		borderRadius: 4,
		background: '#fff',
		border: 'none',
		boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.12)',
		direction: 'ltr',
		boxSizing: 'border-box',
		height: '306px',
		width: '496px',
		position: 'absolute',
		overflow: 'hidden',
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: '8px 16px',
		backgroundColor: '#E5E5E5',
	},
	title: {
		cursor: 'default',
		height: '100%',
		lineHeight: '24px',
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
		paddingBottom: 24,
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
	selectWrapper: { border: 'none', outline: 'none', width: '368px' },
	customSelect: {
		display: 'flex',
		justifyContent: 'space-between',
		cursor: 'pointer',
		borderRadius: 4,
		padding: '5px 12px',
		width: '100%',
		margin: 2,
		backgroundColor: '#FFF',
		boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.12)',
	},
	openSelect: {
		border: '1px solid #5CBEEF',
	},
	optionsWrapper: {
		position: 'absolute',
		height: '134px',
		width: '368px',
		overflowY: 'scroll',
		boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.12)',
		borderRadius: 4,
		margin: 2,
		'&::-webkit-scrollbar': {
			display: 'none',
		},
	},
	customOption: {
		width: '100%',
		cursor: 'pointer',
		backgroundColor: '#FFF',
		border: 'none',
		padding: '8px 12px',
	},
	disable: {
		display: 'none',
	},
	addDictionary: {
		marginTop: 24,
		width: 'fit-content',
		...button(),
		backgroundColor: '#0099E5',
		'&:hover': {
			backgroundColor: '#EEF2F6',
			color: 'rgba(51, 51, 51, 0.8)',
		},
		'&:active': {
			backgroundColor: '#0099E5',
			color: '#FFF',
		},
	},
});

interface DictionaryLinksEditorProps {
	showAddDictionary: boolean;
	setShowAddDictionary: (prop: boolean) => void;
}

const DictionaryLinksEditor = ({
	showAddDictionary,
	setShowAddDictionary,
}: DictionaryLinksEditorProps) => {
	const classes = useLinksStyles();
	const boxesStore = useBoxesStore();
	const dictionaryLinksStore = useDictionaryLinksStore();

	const options = useMemo(() => {
		return boxesStore.dictionaries
			.filter(
				dict =>
					!dictionaryLinksStore.linkedDictionaries?.some(
						link => link.dictionary.name === dict.name,
					),
			)
			.map(dict => dict.name);
	}, [boxesStore.dictionaries, dictionaryLinksStore.linkedDictionaries]);

	const [newLinkedDictionaryName, setNewLinkedDictionaryName] = useState(options[0]);

	const [openSelect, setOpenSelect] = useState(false);

	const applyNewLink = () => {
		setShowAddDictionary(false);
		if (boxesStore.selectedBox && newLinkedDictionaryName) {
			const newLinkDictionary: DictionaryRelation = {
				name: `${boxesStore.selectedBox.name}-dictionary`,
				box: boxesStore.selectedBox.name,
				dictionary: {
					name: newLinkedDictionaryName,
					type: 'MAIN',
				},
			};
			dictionaryLinksStore.addLinkDictionary(newLinkDictionary);
		}
	};

	const changeDictionary = (option: string) => {
		setNewLinkedDictionaryName(option);
		setOpenSelect(false);
	};

	return (
		<div className={classes.links}>
			<p>Linked dictionaries:</p>
			{dictionaryLinksStore.linkedDictionaries.map((link, i) => (
				<Link
					link={link}
					key={`${link.name}-${i}`}
					deleteLink={() => {
						dictionaryLinksStore.deleteLinkDictionary(link);
					}}
				/>
			))}
			{showAddDictionary ? (
				<ModalPortal isOpen={showAddDictionary}>
					<div className={classes.editor}>
						<div className={classes.header}>
							<span className={classes.title}>Add Dictionary</span>
							<span
								className={classes.closeButton}
								onClick={() => setShowAddDictionary(false)}></span>
						</div>
						<div className={classes.content}>
							<div className={classes.selectWrapper}>
								<div
									className={classNames(
										classes.customSelect,
										openSelect ? classes.openSelect : null,
									)}
									onClick={() => setOpenSelect(!openSelect)}>
									{newLinkedDictionaryName}
									{openSelect ? (
										<Icon id='arrowUp' stroke='#5CBEEF' />
									) : (
										<Icon id='arrowDown' stroke='#808080' />
									)}
								</div>
								<div
									className={classNames(
										classes.optionsWrapper,
										!openSelect ? classes.disable : classes.openSelect,
									)}>
									{openSelect &&
										options.map(option => (
											<div
												key={option}
												className={classes.customOption}
												onClick={() => changeDictionary(option)}>
												{option}
											</div>
										))}
								</div>
							</div>
						</div>
						<div className={classes.actions}>
							<button onClick={applyNewLink} className={classNames(classes.button, classes.submit)}>
								Submit
							</button>
							<button
								onClick={() => setShowAddDictionary(false)}
								className={classNames(classes.button, classes.deleteButton)}>
								Cancel
							</button>
						</div>
					</div>
				</ModalPortal>
			) : null}
		</div>
	);
};

export default observer(DictionaryLinksEditor);
