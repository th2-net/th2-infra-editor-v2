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
			height: 'calc(100% + 6px)',
			margin: '3px',
			gridArea: 'box-list',
			overflow: 'hidden',
			display: 'flex',
			flexDirection: 'column',
			borderRadius: 24,
			boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.16)',
			backgroundColor: '#FFFFFF',
		},
		boxList: {
			...scrollBar(),
			marginBottom: '24px',
		},
		item: {
			paddingBottom: '6px',
		},
		groupItem: {
			background: '#5CBEEF',
			margin: '0 24px 4px 24px',
			padding: '16px 12px',
			borderRadius: 4,
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
	const classes = useStyles();

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
					<div className={classes.groupItem}>
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
							entitiesCount={boxes.filter(item => getType(item as BoxEntity) === box.name).length}
							onClick={() => expandGroup(box.name)}
						/>
					)}
				</Observer>
			);
		},
		[
			boxesStore,
			appViewStore,
			selectedDictionaryStore,
			expandedMap,
			expandGroup,
			classes.groupItem,
			classes.item,
		],
	);
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
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			height: '58px',
			fontSize: '14px',
			backgroundColor: '#FFF',
			borderRadius: 4,
			boxShadow: '0px 0px 3px rgba(0, 0, 0, 0.16)',
			margin: '0 24px 4px 24px',
			padding: '16px',
			cursor: 'pointer',
			'&:hover': {
				backgroundColor: '#EEF2F6',
			},
		},
		expanded: {
			backgroundColor: '#5CBEEF',
			'&:hover': {
				backgroundColor: '#5CBEEF',
			},
		},
		dictionaries: {
			gap: '18px',
			justifyContent: 'flex-start',
		},
		name: {
			height: '100%',
			background: 'transparent',
			lineHeight: '26px',
			width: 'fit-content',
		},
		entitiesCount: {
			color: '#fff',
			backgroundColor: '#5CBEEF',
			borderRadius: 12,
			padding: 6,
			height: 'fit-content',
		},
	},
	{ name: 'ExpandGroup' },
);
interface ExpandGroupProps {
	group: GroupEntity;
	isExpand: boolean;
	onClick: () => void;
	entitiesCount: number;
}

function ExpandGroup(props: ExpandGroupProps) {
	const classes = useExpandGroupStyles();

	return (
		<div
			onClick={() => props.onClick()}
			className={classNames(classes.expandGroup, {
				[classes.expanded]: props.isExpand,
				[classes.dictionaries]: props.group.name === 'dictionaries',
			})}>
			{props.group.name === 'dictionaries' ? <Icon id='dictionary' stroke='#333' /> : null}
			<div style={{ gap: '16px', display: 'flex', alignItems: 'center' }}>
				<div className={classes.name}>{props.group.name}</div>
				<div className={classes.entitiesCount}>{props.entitiesCount}</div>
			</div>
			{props.group.name !== 'dictionaries' ? (
				props.isExpand ? (
					<Icon id='arrowUp' stroke='#FFF' />
				) : (
					<Icon id='arrowDown' stroke='#666' />
				)
			) : null}
		</div>
	);
}

const useBoxSearchStyles = createUseStyles(
	{
		search: {
			flexShrink: 0,
			height: 40,
			fontSize: '14px',
			margin: '0 24px 16px 24px',
			borderRadius: 4,
			boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.12)',
		},
		searchInput: {
			backgroundColor: '#F3F3F6',
			width: '100%',
			height: '100%',
			border: 'none',
			outline: 'none',
			padding: '12px',
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
				placeholder='Search for example "Something"'
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
		margin: '24px 24px 12px 24px',
		lineHeight: '16px',
		fontSize: '12px',
		color: '#333333',
		borderRadius: 4,
		gap: 12,
	},
	filtersInput: {
		...visuallyHidden(),
		'&:checked': {
			'&+label': {
				backgroundColor: '#5CBEEF',
				color: '#FFF',
				border: '1px solid #0099E5',
				boxSizing: 'border-box',
			},
		},
	},
	filtersLabel: {
		display: 'inline-flex',
		backgroundColor: '#F3F3F6',
		verticalAlign: 'middle',
		padding: '8px 12px',
		border: '1px solid #E5E5E5',
		borderRadius: 4,
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
				onChange={() => {
					setFilter('all');
				}}
				id='all'
				checked={filter === 'all'}
			/>
			<label htmlFor='all' className={classes.filtersLabel}>
				All
			</label>
			<input
				className={classes.filtersInput}
				type='radio'
				name='filter'
				id='box'
				onChange={() => {
					setFilter('box');
				}}
				checked={filter === 'box'}
			/>
			<label title='Box' htmlFor='box' className={classes.filtersLabel}>
				Boxes
			</label>
			<input
				className={classes.filtersInput}
				type='radio'
				name='filter'
				id='dictionary'
				onChange={() => {
					setFilter('dictionary');
				}}
				checked={filter === 'dictionary'}
			/>
			<label title='Dictionary' htmlFor='dictionary' className={classes.filtersLabel}>
				Dictionaries
			</label>
		</div>
	);
}
