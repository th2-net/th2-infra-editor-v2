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

import { observer } from 'mobx-react-lite';
import { createUseStyles, Styles } from 'react-jss';
import { useSchemaStore } from '../hooks/useSchemaStore';
import arrowDown from '../assets/icons/arrow-down.svg';

const button: Styles = {
	height: '32px',
	width: 'auto',
	borderRadius: '4px',
	color: '#fff',
	padding: '7px 12px',
	textTransform: 'capitalize',
	outline: 'none',
	border: 'none',
	margin: '0 25px',
	fontWeight: '700',
	fontSize: '14px',
	lineHeight: '16px',
	position: 'relative',
	cursor: 'pointer',
	backgroundColor: '#5CBEEF',
	'&:hover': {
		backgroundColor: '#EEF2F6',
		color: 'rgba(51, 51, 51, 0.8)',
	},
	'&:active': {
		backgroundColor: '#0099E5',
	},
	'&:disabled': {
		opacity: '0.4',
	},
};

const useStyles = createUseStyles({
	button,
	container: {
		gridArea: 'header',
		backgroundColor: '#333333',
		height: '80px',
		boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.25)',
		padding: '16px 64px',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	badge: {
		height: '15px',
		width: '15px',
		borderRadius: '50%',
		color: '#fff',
		border: 'none',
		boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
		fontWeight: '600',
		fontSize: '12px',
		lineHeight: '15px',
		position: 'absolute',
		top: '-5px',
		right: '-5px',
		background: '#ed4300',
	},
	disableBadge: {
		display: 'none',
	},
	customSelect: {
		position: 'relative',
		border: 'none',
		outline: 'none',
		cursor: 'pointer',
		borderRadius: 4,
		padding: '5px 12px',
		width: '169px',
		height: '32px',
		appearance: 'none',
		background: `url(${arrowDown})  no-repeat right #FFF`,
		backgroundPositionX: '141px',
		'&::-webkit-scrollbar': {
			display: 'none',
		},
	},
	customOption: {
		appearance: 'none',
		width: '169px',
		padding: '8px 12px',
	},
});

function Header() {
	const { requestsStore, schemas, selectSchema, selectedSchemaName } = useSchemaStore();
	const { requestsExist, saveChanges, preparedRequests } = requestsStore;

	const classes = useStyles();

	return (
		<div className={classes.container}>
			{schemas.length !== 0 && (
				<select
					className={classes.customSelect}
					onChange={e => selectSchema(e.target.value)}
					value={selectedSchemaName || undefined}>
					{schemas.map(schema => (
						<option className={classes.customOption} key={schema} value={schema}>
							{schema}
						</option>
					))}
				</select>
			)}
			<button disabled={!requestsExist} className={classes.button} onClick={saveChanges}>
				<span className={requestsExist ? classes.badge : classes.disableBadge}>
					{preparedRequests.length}
				</span>
				Submit Changes
			</button>
		</div>
	);
}

export default observer(Header);
