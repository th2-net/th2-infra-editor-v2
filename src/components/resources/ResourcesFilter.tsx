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
import { capitalize } from 'lodash';
import { createUseStyles } from 'react-jss';
import { visuallyHidden } from '../../styles/mixins';
import AppViewType from '../../util/AppViewType';

const useBoxFiltersStyles = createUseStyles({
	filters: {
		display: 'flex',
		margin: '24px 12px 12px 24px',
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

export enum BoxFilters {
	all = 'All',
	box = 'Boxes',
	dictionary = 'Dictionaries',
}

const filterOptions: BoxFilters[] = [BoxFilters.all, BoxFilters.box, BoxFilters.dictionary];

interface BoxFiltersProps {
	filter: BoxFilters;
	setFilter: (filter: BoxFilters) => void;
	setViewType: (viewType: AppViewType) => void;
}

function ResourcesFilter(props: BoxFiltersProps) {
	const { filter: selectedFilter, setFilter } = props;

	const classes = useBoxFiltersStyles();

	return (
		<div className={classes.filters}>
			{filterOptions.map(filter => (
				<React.Fragment key={filter}>
					<input
						className={classes.filtersInput}
						type='radio'
						name={filter}
						id={filter}
						value={filter}
						onChange={e => setFilter(e.target.value as BoxFilters)}
						checked={selectedFilter === filter}
					/>
					<label title={capitalize(filter)} htmlFor={filter} className={classes.filtersLabel}>
						{filter}
					</label>
				</React.Fragment>
			))}
		</div>
	);
}

export default ResourcesFilter;
