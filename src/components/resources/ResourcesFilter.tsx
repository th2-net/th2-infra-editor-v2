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
import Icon from '../Icon';
import { visuallyHidden } from '../../styles/mixins';

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

export enum BoxFilters {
	all = 'all',
	box = 'box',
	dictionary = 'dictionary',
}

const filterOptions: BoxFilters[] = [BoxFilters.all, BoxFilters.box, BoxFilters.dictionary];

interface BoxFiltersProps {
	filter: BoxFilters;
	setFilter: (filter: BoxFilters) => void;
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
						{filter === BoxFilters.all ? filter : <Icon id={filter} stroke='black' />}
					</label>
				</React.Fragment>
			))}
		</div>
	);
}

export default ResourcesFilter;
