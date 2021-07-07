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

import { observer } from "mobx-react-lite";
import { useMemo, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import { useBoxesStore } from "../../hooks/useBoxesStore";
import { useDictionaryLinksStore } from "../../hooks/useDictionaryLinksStore";
import useOutsideClickListener from "../../hooks/useOutsideClickListener";
import { useSelectedDictionaryStore } from "../../hooks/useSelectedDictionaryStore";
import { DictionaryRelation } from "../../models/Dictionary";
import Icon from "../Icon";
import Select from "../util/Select";
import { useLinksStyles } from "./DictionaryLinksEditor";

interface DictionaryLinkProps {
	link: DictionaryRelation;
	deleteLink: () => void;
}

const useLinkStyle = createUseStyles({
	link: {
		cursor: 'pointer',
		padding: '0 2px',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		'&:hover': {
			backgroundColor: '#e5e5e5'
		}
	},
	title: {
		display: 'flex',
		'&>p': {
			margin: '0 0 0 2px'
		}
	},
	delete: {
		display: 'inline-flex',
		padding: '0 2px',
		verticalAlign: 'middle',
		backgroundColor: 'transparent',
		outline: 'none',
		border: 'none',
		cursor: 'pointer',
	}
})

const Link = ({link, deleteLink}: DictionaryLinkProps) => {
	const classes = useLinkStyle();
	return (
		<div className={classes.link}>
			<div className={classes.title}>
				<Icon id='box' stroke='black' />
				<p>{link.box}</p>
			</div>
			<button className={classes.delete} onClick={deleteLink}><Icon id='cross' stroke='black' width={8} height={8}/></button>
		</div>
	)
}

const BoxLinksEditor = () => {
	const classes = useLinksStyles();
	const boxesStore = useBoxesStore();
	const selectedDictionaryStore = useSelectedDictionaryStore();
	const dictionaryLinksStore = useDictionaryLinksStore();

	const options = useMemo(() => {
		return boxesStore.boxes
			.filter(box => !dictionaryLinksStore.linkedBoxes?.some(link => link.box === box.name))
			.map(box => box.name)
	}, [boxesStore.boxes, dictionaryLinksStore.linkedBoxes]);

	const [newLinkedBoxName, setNewLinkedBoxName] = useState(options[0]);
	const [showAddBox, setShowAddBox] = useState(false);

	const ref = useRef<HTMLDivElement>(null);
	useOutsideClickListener(ref, () => {
		setShowAddBox(false);
	});

	const applyNewLink = () => {
		setShowAddBox(false);
		if (selectedDictionaryStore.dictionary && newLinkedBoxName) {
			const newLinkDictionary: DictionaryRelation = {
				name: `${newLinkedBoxName}-dictionary`,
				box: newLinkedBoxName,
				dictionary: {
					name: selectedDictionaryStore.dictionary.name,
					type: 'MAIN'
				}
			}
			dictionaryLinksStore.addLinkDictionary(newLinkDictionary);
		}
	};

	return (
		<div className={classes.links} ref={ref}>
			<p>Linked boxes:</p>
			{dictionaryLinksStore.linkedBoxes.map((link, i) => (
				<Link link={link} key={`${link.name}-${i}`} deleteLink={() => {dictionaryLinksStore.deleteLinkDictionary(link)}}/>
			))}
			{showAddBox 
				? <div>
						<Select
							options={options}
							selected={newLinkedBoxName}
							onChange={setNewLinkedBoxName}
						/>
						<button onClick={applyNewLink}>
							<Icon id='check' stroke='black' />
						</button>
					</div>
				: <button 
						className={classes.add}
						onClick={() => setShowAddBox(true)}
					>
						+
					</button>
			}
		</div>
	);
};

export default observer(BoxLinksEditor);
	