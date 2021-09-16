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

import { computed } from 'mobx';
import { observer } from 'mobx-react-lite';
import { createUseStyles, Styles } from 'react-jss';
import { useSchemaStore } from '../hooks/useSchemaStore';

const button: Styles = {
	height: '30px',
	width: 'auto',
	borderRadius: '17px',
	color: '#fff',
	padding: '7px 12px',
	textTransform: 'capitalize',
	outline: 'none',
	border: 'none',
	margin: '0 25px',
	boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
	fontWeight: '600',
	fontSize: '13px',
	lineHeight: '16px',
	position: 'relative',
};

const useStyles = createUseStyles({
	container: {
		gridArea: 'header',
		backgroundColor: '#7a99b8',
		height: '60px',
		boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.25)',
		padding: '15px 60px',
		display: 'flex',
		alignItems: 'center',
	},
	submitButton: {
		...button,
		background: '#ffa666',
		'&:hover': {
			background: '#ffb37c',
		},
		'&:active': {
			background: '#ffc093',
		},
	},
	disableButton: {
		...button,
		background: '#979797',
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
});

function Header() {
	const schemaStore = useSchemaStore();
	const requestsExist = schemaStore.requestsStore.requestsExist;

	const classes = useStyles();

	return (
		<div className={classes.container}>
			{schemaStore.schemas.length !== 0 && (
				<select
					onChange={e => schemaStore.selectSchema(e.target.value)}
					value={schemaStore.selectedSchemaName || undefined}>
					{schemaStore.schemas.map(schema => (
						<option key={schema} value={schema}>
							{schema}
						</option>
					))}
				</select>
			)}
			<button
				disabled={!requestsExist}
				className={requestsExist ? classes.submitButton : classes.disableButton}
				onClick={schemaStore.requestsStore.saveChanges}>
				<span className={requestsExist ? classes.badge : classes.disableBadge}>
					{schemaStore.requestsStore.preparedRequests.length}
				</span>
				Submit changes
			</button>
		</div>
	);
}

export default observer(Header);
