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
import { useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useBoxesStore } from '../../hooks/useBoxesStore';
import { useDictionaryLinksStore } from '../../hooks/useDictionaryLinksStore';
import useOutsideClickListener from '../../hooks/useOutsideClickListener';
import { DictionaryRelation } from '../../models/Dictionary';
import Icon from '../Icon';
import Select from '../util/Select';

export const useLinksStyles = createUseStyles({
	links: {
		width: '100%',
		fontSize: 12,
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
});

interface DictionaryLinkProps {
	link: DictionaryRelation;
	deleteLink: () => void;
}

const useLinkStyle = createUseStyles({
	link: {
		padding: '0 2px',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		'&:hover': {
			backgroundColor: '#e5e5e5',
		},
	},
	title: {
		display: 'flex',
		'&>p': {
			margin: '0 0 0 2px',
		},
	},
	delete: {
		display: 'inline-flex',
		padding: '0 2px',
		verticalAlign: 'middle',
		backgroundColor: 'transparent',
		outline: 'none',
		border: 'none',
		cursor: 'pointer',
	},
});

const Link = ({ link, deleteLink }: DictionaryLinkProps) => {
	const classes = useLinkStyle();
	return (
		<div className={classes.link}>
			<div className={classes.title}>
				<Icon id='dictionary' stroke='black' />
				<p>{link.dictionary.name}</p>
			</div>
			<button className={classes.delete} onClick={deleteLink}>
				<Icon id='cross' stroke='black' width={8} height={8} />
			</button>
		</div>
	);
};

const DictionaryLinksEditor = () => {
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

	const [showAddDictionary, setShowAddDictionary] = useState(false);
	const [newLinkedDictionaryName, setNewLinkedDictionaryName] = useState(options[0]);

	const ref = useRef<HTMLDivElement>(null);
	useOutsideClickListener(ref, () => {
		setShowAddDictionary(false);
	});

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

	return (
		<div className={classes.links} ref={ref}>
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
				<div>
					<Select
						options={options}
						selected={newLinkedDictionaryName}
						onChange={setNewLinkedDictionaryName}
					/>
					<button onClick={applyNewLink}>
						<Icon id='check' stroke='black' />
					</button>
				</div>
			) : options.length ? (
				<button className={classes.add} onClick={() => setShowAddDictionary(true)}>
					+
				</button>
			) : null}
		</div>
	);
};

export default observer(DictionaryLinksEditor);
