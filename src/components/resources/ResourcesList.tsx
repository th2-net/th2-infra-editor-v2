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
import { observer, Observer } from 'mobx-react-lite';
import { createUseStyles } from 'react-jss';
import { Virtuoso } from 'react-virtuoso';
import { toLower } from 'lodash';
import { BoxEntity, isBoxEntity } from '../../models/Box';
import { scrollBar } from '../../styles/mixins';
import Box, { getBoxType } from './Box';
import Dictionary from './Dictionary';
import { DictionaryEntity, isDictionaryEntity } from '../../models/Dictionary';
import { useSelectedDictionaryStore } from '../../hooks/useSelectedDictionaryStore';
import { useBoxesStore } from '../../hooks/useBoxesStore';
import classNames from 'classnames';
import { useAppViewStore } from '../../hooks/useAppViewStore';
import { BoxFilters } from './ResourcesFilter';
import ResourcesSearch from './ResourcesSearch';
import ResourcesListHeader from './ResourcesListHeader';
import AppViewType from '../../util/AppViewType';

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
	{ name: 'ResourcesList' },
);

interface GroupEntity {
	name: string;
}

type Entity = GroupEntity | BoxEntity | DictionaryEntity;

function ResourcesList() {
	const boxesStore = useBoxesStore();
	const selectedDictionaryStore = useSelectedDictionaryStore();
	const appViewStore = useAppViewStore();

	const [searchValue, setSearchValue] = useState('');
	const [filter, setFilter] = useState<BoxFilters>(BoxFilters.all);
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
										appViewStore.setViewType(AppViewType.BoxView);
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
										appViewStore.setViewType(AppViewType.DictionaryView);
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[boxesStore, groupedBoxes, appViewStore, selectedDictionaryStore, expandedMap, expandGroup],
	);

	const classes = useStyles();

	return (
		<div className={classes.container}>
			<ResourcesListHeader
				filter={filter}
				setFilter={setFilter}
				setViewType={appViewStore.setViewType}
			/>
			<ResourcesSearch filter={filter} setValue={setSearchValue} />
			<Virtuoso data={groupedBoxes} itemContent={renderBox} className={classes.boxList} />
		</div>
	);
}

export default observer(ResourcesList);

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
