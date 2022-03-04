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

const useResourcesSearchStyles = createUseStyles(
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

interface ResourcesSearchProps {
	setValue: (debouncedSearchValue: string) => void;
}

function ResourcesSearch({ setValue }: ResourcesSearchProps) {
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

export default ResourcesSearch;
