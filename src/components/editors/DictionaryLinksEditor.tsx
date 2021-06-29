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

import { useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import useOutsideClickListener from "../../hooks/useOutsideClickListener";
import { DictionaryRelation } from "../../models/Dictionary";
import Icon from "../Icon";

interface DictionaryLinksEditorProps {
	links?: DictionaryRelation[];
};

const useLinksStyles = createUseStyles({
		links: {
			width: '100%',
			fontSize: 12,
		},
		add: {

		}
});

interface DictionaryLinkProps {
	link: DictionaryRelation;
}

const useLinkStyle = createUseStyles({
	link: {
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

const Link = ({link}: DictionaryLinkProps) => {
	const classes = useLinkStyle();
	return (
		<div className={classes.link}>
			<div className={classes.title}>
				<Icon id='book' stroke='black' />
				<p>{link.dictionary.name}</p>
			</div>
			<button className={classes.delete}><Icon id='cross' stroke='black' width={8} height={8}/></button>
		</div>
	)
}

const DictionaryLinksEditor = ({ links }: DictionaryLinksEditorProps) => {
	const classes = useLinksStyles();
	const [showAddBox, setShowAddBox] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	useOutsideClickListener(ref, () => {
		setShowAddBox(false);
	})
	return links 
		? <div className={classes.links} ref={ref}>
				<p>Linked dictionaries:</p>
				{links.map((link, i) => (
					<Link link={link} key={`${link.name}-${i}`} />
				))}
				{showAddBox 
					? 'add'
					: <button className={classes.add} onClick={() => setShowAddBox(true)}>+</button>
				}
			</div>
		: null;
};

export default DictionaryLinksEditor;
	