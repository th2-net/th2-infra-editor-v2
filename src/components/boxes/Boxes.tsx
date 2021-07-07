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
import { BoxEntity, isBoxEntity } from '../../models/Box';
import { scrollBar } from '../../styles/mixins';
import Box from './Box';
import Dictionary from './Dictionary';
import { useDebouncedCallback } from 'use-debounce/lib';
import { DictionaryEntity } from '../../models/Dictionary';
import { AppView } from '../../App';
import { useSelectedDictionaryStore } from '../../hooks/useSelectedDictionaryStore';
import { useBoxesStore } from '../../hooks/useBoxesStore';

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
	const selectedDictionaryStore = useSelectedDictionaryStore();

	const [searchValue, setSearchValue] = useState('');

	const boxes = useMemo(() => {
		return searchValue
			? boxesStore.allEntities.filter(box => toLower(box.name).includes(toLower(searchValue)))
			: boxesStore.allEntities;
	}, [searchValue, boxesStore.allEntities]);

	const renderBox = useCallback((index: number, box: BoxEntity | DictionaryEntity) => {
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
								boxesStore.selectBox(box);
							}}
							isSelected={boxesStore.selectedBox?.name === box.name}
						/>
					)}
				</Observer>
			);
		}
		return (
			<Observer>
				{() => (
					<Dictionary
						dictionary={box}
						onClick={() => {
							props.setViewType('dictionary');
							selectedDictionaryStore.selectDictionary(box);
						}}
					/>
				)}
			</Observer>
		);
	}, []);

	const classes = useStyles();

	return (
		<div className={classes.container}>
			<BoxSearch setValue={setSearchValue} />
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
