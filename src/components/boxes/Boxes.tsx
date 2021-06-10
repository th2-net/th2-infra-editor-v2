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

import { useCallback } from 'react';
import { action, computed } from 'mobx';
import { observer, useLocalObservable, useLocalStore } from 'mobx-react-lite';
import { createUseStyles } from 'react-jss';
import { Virtuoso } from 'react-virtuoso';
import { toLower } from 'lodash';
import { BoxEntity } from '../../models/Box';
import { scrollBar } from '../../styles/mixins';
import Box from './Box';
import { useSchemaStore } from '../../hooks/useSchemaStore';
import { useDebouncedCallback } from 'use-debounce/lib';

const useStyles = createUseStyles(
	{
		container: {
			gridArea: 'box-list',
			overflow: 'hidden',
			display: 'flex',
			flexDirection: 'column',
			borderRadius: 6,
		},
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
		boxList: {
			...scrollBar(),
		},
	},
	{ name: 'Boxes' },
);

interface SearchState {
	value: string;
	debouncedValue: string;
	setValue: (v: string) => void;
}

function Boxes() {
	const schemaStore = useSchemaStore();

	const search = useLocalObservable<SearchState>(() => ({
		value: '',
		debouncedValue: '',
		setValue(searchValue: string) {
			search.value = searchValue;
		},
	}));

	const boxes = computed(() =>
		search.debouncedValue
			? schemaStore.boxes.filter(box => toLower(box.name).includes(toLower(search.debouncedValue)))
			: schemaStore.boxes,
	).get();

	const setDebouncedValue = useDebouncedCallback((value: string) => {
		action(() => (search.debouncedValue = value));
	}, 600);

	function onSearchValueChange(e: React.ChangeEvent<HTMLInputElement>) {
		const { value } = e.target;
		search.setValue(value);
		setDebouncedValue(value);
	}

	const renderBox = useCallback((index: number, box: BoxEntity) => {
		const group = schemaStore.groupsConfig.find(group => group.types.includes(box.spec.type));
		return <Box box={box} color={group?.color} />;
	}, []);

	const classes = useStyles();

	return (
		<div className={classes.container}>
			<div className={classes.search}>
				<input
					type='text'
					placeholder='Box name'
					value={search.value}
					className={classes.searchInput}
					onChange={onSearchValueChange}
				/>
			</div>
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
