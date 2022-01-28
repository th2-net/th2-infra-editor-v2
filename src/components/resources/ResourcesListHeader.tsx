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

import { createUseStyles } from 'react-jss';
import Icon from '../Icon';
import ResourcesFilter, { BoxFilters } from './ResourcesFilter';
import { buttonReset, clickable } from '../../styles/mixins';
import AppViewType from '../../util/AppViewType';

const useStyles = createUseStyles(
	{
		header: {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		addButton: {
			...buttonReset(),
			...clickable(),
			padding: 3,
			borderRadius: 4,
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		},
	},
	{ name: 'ResourcesListHeader' },
);

interface BoxFiltersProps {
	filter: BoxFilters;
	setFilter: (filter: BoxFilters) => void;
	setViewType: (viewType: AppViewType) => void;
}

const ResourcesListHeader = (props: BoxFiltersProps) => {
	const classes = useStyles();

	const createNewResource = () => {
		if (props.filter === BoxFilters.all || props.filter === BoxFilters.box) {
			props.setViewType(AppViewType.BoxCreate);
		} else {
			// Implement dictionary creating
			props.setViewType(AppViewType.BoxCreate);
		}
	};

	return (
		<div className={classes.header}>
			<ResourcesFilter {...props} />
			<button className={classes.addButton} onClick={createNewResource} title='New box'>
				<Icon id='plus' stroke='black' />
			</button>
		</div>
	);
};

export default ResourcesListHeader;
