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

import React, { useCallback, useMemo, useState } from 'react';
import { observer, Observer } from 'mobx-react-lite';
import { createUseStyles } from 'react-jss';
import { Virtuoso } from 'react-virtuoso';
import { toLower } from 'lodash';
import { BoxEntity, isBoxEntity } from '../../models/Box';
import { scrollBar, visuallyHidden } from '../../styles/mixins';
import Box, { getBoxType } from './Box';
import Dictionary from './Dictionary';
import { useDebouncedCallback } from 'use-debounce/lib';
import { DictionaryEntity, isDictionaryEntity } from '../../models/Dictionary';
import { useSelectedDictionaryStore } from '../../hooks/useSelectedDictionaryStore';
import { useBoxesStore } from '../../hooks/useBoxesStore';
import Icon from '../Icon';
import classNames from 'classnames';
import { useAppViewStore } from '../../hooks/useAppViewStore';

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
			marginTop: '10px',
			...scrollBar(),
		},
		item: {
			paddingBottom: '6px',
		},
		groupItem: {
			background: '#fff',
			padding: '3px',
			marginBottom: '6px',
			borderRadius: '6px',
		},
		nextGroupItem: {
			paddingBottom: '6px',
			marginBottom: '0',
			WebkitBorderBottomLeftRadius: '0',
			WebkitBorderBottomRightRadius: '0',
		},
		prevGroupItem: {
			WebkitBorderTopLeftRadius: '0',
			WebkitBorderTopRightRadius: '0',
		},
	},
	{ name: 'Boxes' },
);

interface GroupEntity {
	name: string;
}

type Entity = GroupEntity | BoxEntity | DictionaryEntity;

function Boxes() {
	const boxesStore = useBoxesStore();
	const selectedDictionaryStore = useSelectedDictionaryStore();
	const appViewStore = useAppViewStore();

	const [searchValue, setSearchValue] = useState('');
	const [filter, setFilter] = useState<BoxFilters>('all');
	const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

	const boxes = useMemo(() => {
		let allEntities;
		switch (filter) {
			case 'box':
				allEntities = boxesStore.boxes;
				break;
			case 'dictionary':
				allEntities = boxesStore.dictionaries;
				break;
			default:
				allEntities = boxesStore.allEntities;
				break;
		}
		return searchValue
			? allEntities.filter(box => toLower(box.name).includes(toLower(searchValue)))
			: allEntities;
	}, [boxesStore.boxes, boxesStore.dictionaries, boxesStore.allEntities, searchValue, filter]);

	const getType = (box: any): string => {
		if (isBoxEntity(box)) {
			return getBoxType(box);
		} else if (isDictionaryEntity(box)) {
			return 'dictionaries';
		} else {
			return box.name;
		}
	};

	const expandGroup = useCallback(
		(name: string): void => {
			if (expandedGroups.includes(name)) {
				setExpandedGroups(expandedGroups.filter(group => group !== name));
			} else {
				setExpandedGroups([...expandedGroups, name]);
			}
		},
		[expandedGroups, setExpandedGroups],
	);

	const expandedMap = useMemo(() => {
		const map = new Map<string, boolean>();

		boxes.forEach(box => {
			const type = getType(box);
			map.set(type, expandedGroups.includes(type));
		});

		return map;
	}, [boxes, expandedGroups]);

	const groupedBoxes = useMemo(() => {
		let result: Entity[] = [];
		let singleEntities: Entity[] = [];

		for (let group of expandedMap.keys()) {
			const filteredBoxes = boxes.filter(box => getType(box) === group);
			if (filteredBoxes.length === 1) {
				singleEntities = [...singleEntities, ...filteredBoxes];
				continue;
			}

			if (expandedMap.get(group)) {
				result = [...result, { name: group }, ...filteredBoxes];
			} else {
				result = [...result, { name: group }];
			}
		}

		result = [...result, ...singleEntities];

		return result;
	}, [boxes, expandedMap]);

	const renderBox = useCallback(
		(index: number, box: Entity) => {
			if (isBoxEntity(box)) {
				const group = boxesStore.groupsConfig.find(group =>
					group.types.includes((box as BoxEntity).spec.type),
				);
				return (
					<div
						className={classNames(classes.groupItem, {
							[classes.nextGroupItem]:
								index + 1 < groupedBoxes.length &&
								getType(groupedBoxes[index + 1]) === getType(box),
							[classes.prevGroupItem]:
								index - 1 >= 0 && getType(groupedBoxes[index - 1]) === getType(box),
						})}>
						<Observer>
							{() => (
								<Box
									box={box}
									color={group?.color}
									onSelect={box => {
										appViewStore.setViewType('box');
										boxesStore.selectBox(box);
									}}
									isSelected={boxesStore.selectedBox?.name === (box as BoxEntity).name}
								/>
							)}
						</Observer>
					</div>
				);
			}
			if (isDictionaryEntity(box)) {
				return (
					<div className={classes.item}>
						<Observer>
							{() => (
								<Dictionary
									dictionary={box}
									onClick={() => {
										appViewStore.setViewType('dictionary');
										selectedDictionaryStore.selectDictionary(box);
									}}
								/>
							)}
						</Observer>
					</div>
				);
			}

			return (
				<Observer>
					{() => (
						<ExpandGroup
							group={box}
							isExpand={expandedMap.get(box.name) || false}
							onClick={() => expandGroup(box.name)}
						/>
					)}
				</Observer>
			);
		},
		[boxesStore, groupedBoxes, appViewStore, selectedDictionaryStore, expandedMap, expandGroup],
	);

	const classes = useStyles();

	return (
		<div className={classes.container}>
			<BoxFilter filter={filter} setFilter={setFilter} />
			<BoxSearch setValue={setSearchValue} />
			<Virtuoso data={groupedBoxes} itemContent={renderBox} className={classes.boxList} />
		</div>
	);
}

export default observer(Boxes);

const useExpandGroupStyles = createUseStyles(
	{
		expandGroup: {
			height: '25px',
			width: '100%',
			display: 'grid',
			gridTemplateAreas: `
				"button name"
			`,
			gridTemplateRows: '1fr',
			gridTemplateColumns: '25px 1fr',
			gap: '6px',
			cursor: 'pointer',
			margin: '10px 0',
		},
		expanded: {
			margin: '10px 0 0 0',
			background: '#fff',
			borderRadius: '6px 6px 0 0',
		},
		expandButton: {
			width: '25px',
			height: '25px',
			border: 'none',
			gridArea: 'button',
			lineHeight: '25px',
			fontWeight: 'bold',
			fontSize: '15px',
			background: '#fff',
			textAlign: 'center',
			borderRadius: '50%',
			transition: '250ms',
			userSelect: 'none',
			'&:hover': {
				background: 'rgba(255, 255, 255, 0.8)',
			},
			'&:active': {
				background: 'rgba(255, 255, 255, 0.5)',
			},
		},
		rotateButton: {
			transform: 'rotate(90deg)',
		},
		name: {
			width: '100%',
			height: '100%',
			lineHeight: '25px',
			gridArea: 'name',
			background: 'transparent',
			borderRadius: '7px',
			padding: '0 15px',
			'&:hover': {
				background: 'rgba(0, 0, 0, 0.1)',
			},
			'&:active': {
				background: 'rgba(0, 0, 0, 0.3)',
			},
		},
	},
	{ name: 'ExpandGroup' },
);
interface ExpandGroupProps {
	group: GroupEntity;
	isExpand: boolean;
	onClick: () => void;
}

function ExpandGroup(props: ExpandGroupProps) {
	const classes = useExpandGroupStyles();

	return (
		<div
			onClick={() => props.onClick()}
			className={classNames(classes.expandGroup, {
				[classes.expanded]: props.isExpand && props.group.name !== 'dictionaries',
			})}>
			<div
				className={classNames(classes.expandButton, {
					[classes.rotateButton]: props.isExpand,
				})}>
				&gt;
			</div>
			<div className={classes.name}>{props.group.name}</div>
		</div>
	);
}

const useBoxSearchStyles = createUseStyles(
	{
		search: {
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
	},
	{ name: 'BoxSearch' },
);
interface BoxSearchProps {
	setValue: (debouncedSearchValue: string) => void;
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
		</div>
	);
}

type BoxFilters = 'all' | 'box' | 'dictionary';

interface BoxFiltersProps {
	filter: BoxFilters;
	setFilter: (filter: BoxFilters) => void;
}

const useBoxFiltersStyles = createUseStyles({
	filters: {
		display: 'flex',
	},
	filtersInput: {
		...visuallyHidden(),
		'&:checked': {
			'&+label': {
				backgroundColor: '#fff',
			},
		},
	},
	filtersLabel: {
		display: 'inline-flex',
		verticalAlign: 'middle',
		padding: 6,
		cursor: 'pointer',
	},
});

function BoxFilter({ filter, setFilter }: BoxFiltersProps) {
	const classes = useBoxFiltersStyles();
	return (
		<div className={classes.filters}>
			<input
				className={classes.filtersInput}
				type='radio'
				name='filter'
				onClick={() => {
					setFilter('all');
				}}
				id='all'
				checked={filter === 'all'}
			/>
			<label htmlFor='all' className={classes.filtersLabel}>
				all
			</label>
			<input
				className={classes.filtersInput}
				type='radio'
				name='filter'
				id='box'
				onClick={() => {
					setFilter('box');
				}}
				checked={filter === 'box'}
			/>
			<label title='Box' htmlFor='box' className={classes.filtersLabel}>
				<Icon id='box' stroke='black' />
			</label>
			<input
				className={classes.filtersInput}
				type='radio'
				name='filter'
				id='dictionary'
				onClick={() => {
					setFilter('dictionary');
				}}
				checked={filter === 'dictionary'}
			/>
			<label title='Dictionary' htmlFor='dictionary' className={classes.filtersLabel}>
				<Icon id='book' stroke='black' />
			</label>
		</div>
	);
}
