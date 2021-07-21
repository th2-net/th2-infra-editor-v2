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

import { useCallback, useState, useMemo } from 'react';
import { observer, Observer } from 'mobx-react-lite';
import { createUseStyles } from 'react-jss';
import { Virtuoso } from 'react-virtuoso';
import { toLower } from 'lodash';
import Switcher, { SwitcherCase } from '../util/Switcher';
import { isBoxEntity } from '../../models/Box';
import { buttonReset, scrollBar } from '../../styles/mixins';
import Box from './Box';
import Dictionary from './Dictionary';
import OtherBox from './OtherBox';
import { useDebouncedCallback } from 'use-debounce/lib';
import { isDictionaryEntity } from '../../models/Dictionary';
import { AppView } from '../../App';
import { useBoxesStore } from '../../hooks/useBoxesStore';
import Icon from '../Icon';
import FileBase from '../../models/FileBase';
import { useEntityEditor } from '../../hooks/useEntityEditor';

enum BoxFilterNames {
	ALL = 'all',
	BOX = 'box',
	DICTIONARY = 'dictionary',
	OTHERS = 'others',
}

const boxFilterConfig: SwitcherCase<BoxFilterNames>[] = Object.values(BoxFilterNames).map(name => ({
	id: name,
	value: name,
	name: 'filter',
	label: name === BoxFilterNames.ALL || name === BoxFilterNames.OTHERS ? name : <Icon id={name} stroke='black'/> 
}))

const useStyles = createUseStyles(
	{
		container: {
			gridArea: 'box-list',
			overflow: 'hidden',
			display: 'flex',
			flexDirection: 'column',
			borderRadius: 6,
		},
		boxList: {
			...scrollBar(),
		},
	},
	{ name: 'Boxes' },
);

interface Props {
	setViewType: (viewType: AppView) => void;
}

function Boxes(props: Props) {
	const boxesStore = useBoxesStore();
	const entityEditor = useEntityEditor();

	const [searchValue, setSearchValue] = useState('');
	const [filter, setFilter] = useState<BoxFilterNames>(BoxFilterNames.ALL);

	const boxes = useMemo(() => {
		let allEntities;
		switch (filter) {
			case BoxFilterNames.BOX:
				allEntities = boxesStore.boxes;
				break;
			case BoxFilterNames.DICTIONARY:
				allEntities = boxesStore.dictionaries;
				break;
			case BoxFilterNames.OTHERS:
				allEntities = boxesStore.others;
				break;
			default:
				allEntities = boxesStore.allEntities;
				break;
		}
		return searchValue
			? allEntities.filter(box => toLower(box.name).includes(toLower(searchValue)))
			: allEntities;
	}, [
		boxesStore.others,
		boxesStore.boxes,
		boxesStore.dictionaries,
		boxesStore.allEntities,
		searchValue,
		filter
	]);

	const renderBox = useCallback((index: number, box: FileBase) => {
		if (isBoxEntity(box)) {
			const group = boxesStore.groupsConfig.find(group => group.types.includes(box.spec.type));
			return (
				<Observer>
					{() => (
						<Box
							box={box}
							color={group?.color}
							onSelect={box => {
								props.setViewType('box');
								entityEditor.setEntity(box);
								boxesStore.selectBox(box);
							}}
							isSelected={boxesStore.selectedBox?.name === box.name}
						/>
					)}
				</Observer>
			);
		}
		if (isDictionaryEntity(box)) {
			return (
				<Observer>
					{() => (
						<Dictionary
							dictionary={box}
							onClick={() => {
								props.setViewType('dictionary');
								entityEditor.setEntity(box);
							}}
						/>
					)}
				</Observer>
			);
		}
		return <OtherBox file={box} onClick={() => {
			props.setViewType('unknown');
			entityEditor.setEntity(box);
		}}/>
	}, []);

	const classes = useStyles();

	return (
		<div className={classes.container}>
			<Switcher cases={boxFilterConfig} currentCase={filter} setCurrentCase={setFilter}/>
			<BoxSearch setValue={setSearchValue} setViewType={() => props.setViewType('new')}/>
			<Virtuoso
				data={boxes}
				itemContent={renderBox}
				components={{ Item: props => <div style={{ paddingBottom: 6 }} {...props} /> }}
				className={classes.boxList}
			/>
		</div>
	);
}

export default observer(Boxes);

const useBoxSearchStyles = createUseStyles(
	{
		search: {
			display: 'flex',
			flexShrink: 0,
			height: 50,
			borderBottom: '1px solid',
		},
		searchInput: {
			width: '100%',
			height: '100%',
			border: 'none',
			outline: 'none',
			padding: '0 15px',
		},
		add: {
			...buttonReset(),
			backgroundColor: 'white',
			padding: 4
		}
	},
	{ name: 'BoxSearch' },
);
interface BoxSearchProps {
	setValue: (debouncedSearchValue: string) => void;
	setViewType: () => void;
}

function BoxSearch(props: BoxSearchProps) {
	const classes = useBoxSearchStyles();

	const [searchValue, setSearchValue] = useState('');

	const setDebouncedValue = useDebouncedCallback((value: string) => {
		props.setValue(value);
	}, 600);

	function onSearchValueChange(e: React.ChangeEvent<HTMLInputElement>) {
		const { value } = e.target;
		setSearchValue(value);
		setDebouncedValue(value);
	}

	return (
		<div className={classes.search}>
			<input
				type='text'
				placeholder='Box name'
				value={searchValue}
				className={classes.searchInput}
				onChange={onSearchValueChange}
			/>
			<button 
				className={classes.add}
				onClick={props.setViewType}
			>
				+
			</button>
		</div>
	);
}
