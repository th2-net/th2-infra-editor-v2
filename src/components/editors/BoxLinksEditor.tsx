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

import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useBoxesStore } from '../../hooks/useBoxesStore';
import { useDictionaryLinksStore } from '../../hooks/useDictionaryLinksStore';
import { useSelectedDictionaryStore } from '../../hooks/useSelectedDictionaryStore';
import { DictionaryRelation } from '../../models/Dictionary';
import Icon from '../Icon';
import { ModalPortal } from '../util/Portal';
import { useLinksStyles } from './DictionaryLinksEditor';
import { scrollBar } from '../../styles/mixins';

interface DictionaryLinkProps {
	link: DictionaryRelation;
	deleteLink: () => void;
}

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

const useCurrentStyles = createUseStyles({
	container: {
		marginTop: 40,
		height: 'calc(100% - 40px)',
		display: 'grid',
		gridTemplateRows: 'auto 150px auto',
		width: 'fit-content',
		backgroundColor: '#FFF',
		border: 'none',
		borderRadius: 24,
		boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.16)',
		padding: 16,
	},
	linksList: {
		...scrollBar(),
		overflowY: 'scroll',
	},
});

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

const BoxLinksEditor = () => {
	const classes = useLinksStyles();
	const currentClasses = useCurrentStyles();
	const boxesStore = useBoxesStore();
	const selectedDictionaryStore = useSelectedDictionaryStore();
	const dictionaryLinksStore = useDictionaryLinksStore();

	const [openSelect, setOpenSelect] = useState(false);

	const options = useMemo(() => {
		return boxesStore.boxes
			.filter(box => !dictionaryLinksStore.linkedBoxes?.some(link => link.box === box.name))
			.map(box => box.name);
	}, [boxesStore.boxes, dictionaryLinksStore.linkedBoxes]);

	const [newLinkedBoxName, setNewLinkedBoxName] = useState(options[0]);
	const [showAddBox, setShowAddBox] = useState(false);

	const changeBox = (option: string) => {
		setNewLinkedBoxName(option);
		setOpenSelect(false);
	};

	const applyNewLink = () => {
		setShowAddBox(false);
		if (selectedDictionaryStore.dictionary && newLinkedBoxName) {
			const newLinkDictionary: DictionaryRelation = {
				name: `${newLinkedBoxName}-dictionary`,
				box: newLinkedBoxName,
				dictionary: {
					name: selectedDictionaryStore.dictionary.name,
					type: 'MAIN',
				},
			};
			dictionaryLinksStore.addLinkDictionary(newLinkDictionary);
		}
	};

	return (
		<div className={classNames(classes.links, currentClasses.container)}>
			<p>Linked boxes:</p>
			<div className={currentClasses.linksList}>
				{dictionaryLinksStore.linkedBoxes.map((link, i) => (
					<Link
						link={link}
						key={`${link.name}-${i}`}
						deleteLink={() => {
							dictionaryLinksStore.deleteLinkDictionary(link);
						}}
					/>
				))}
			</div>
			<button className={classes.addDictionary} onClick={() => setShowAddBox(true)}>
				Add Dictionary
			</button>
			{showAddBox ? (
				<ModalPortal isOpen={showAddBox}>
					<div className={classes.editor}>
						<div className={classes.header}>
							<span className={classes.title}>Add Dictionary</span>
							<span className={classes.closeButton} onClick={() => setShowAddBox(false)}></span>
						</div>
						<div className={classes.content}>
							<div className={classes.selectWrapper}>
								<div
									className={classNames(
										classes.customSelect,
										openSelect ? classes.openSelect : null,
									)}
									onClick={() => setOpenSelect(!openSelect)}>
									{newLinkedBoxName}
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
												onClick={() => changeBox(option)}>
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
								onClick={() => setShowAddBox(false)}
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

export default observer(BoxLinksEditor);
