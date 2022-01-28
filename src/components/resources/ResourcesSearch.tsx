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

import React from 'react';
import { createUseStyles } from 'react-jss';
import { useDebouncedCallback } from 'use-debounce/lib';
import { BoxFilters } from './ResourcesFilter';

const useResourcesSearchStyles = createUseStyles(
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

interface ResourcesSearchProps {
	setValue: (debouncedSearchValue: string) => void;
	filter: BoxFilters;
}

function ResourcesSearch({ setValue, filter }: ResourcesSearchProps) {
	const classes = useResourcesSearchStyles();

	const [searchValue, setSearchValue] = React.useState('');

	const setDebouncedValue = useDebouncedCallback((value: string) => {
		setValue(value);
	}, 600);

	function onSearchValueChange(e: React.ChangeEvent<HTMLInputElement>) {
		const { value } = e.target;
		setSearchValue(value);
		setDebouncedValue(value);
	}

	const placeholder = `${filter[0].toUpperCase() + filter.slice(1)} name`;

	return (
		<div className={classes.search}>
			<input
				type='text'
				placeholder={placeholder}
				value={searchValue}
				className={classes.searchInput}
				onChange={onSearchValueChange}
			/>
		</div>
	);
}

export default ResourcesSearch;
