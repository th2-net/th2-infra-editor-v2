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
import Modal from '@material-ui/core/Modal';
import { useState } from 'react';
import { InvalidLinkItems } from './layouts/InvalidLink';
import { deleteInvalidLinks } from '../helpers/pinConnections';

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
	backgroundColor: '#ffa666',
	'&:hover': {
		backgroundColor: '#ffb37c',
	},
	'&:active': {
		backgroundColor: '#ffc093',
	},
	'&:disabled': {
		backgroundColor: '#979797',
	},
};

const useStyles = createUseStyles({
	button,
	container: {
		gridArea: 'header',
		backgroundColor: '#7a99b8',
		height: '60px',
		boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.25)',
		padding: '15px 60px',
		display: 'flex',
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
	modalWindow: {
		position: 'relative',
		padding: '10px',
		overflow: 'auto',
		top: `${document.documentElement.scrollHeight / 4}px`,
		marginRight: 'auto',
		marginLeft: 'auto',
		width: '80%',
		height: document.documentElement.scrollHeight / 2,
		backgroundColor: 'white',
	},
	modalWindowContent: {
		display: 'grid',
		gridTemplateRows: '90% 10%',
		gridRowGap: '5px',
		height: '100%',
	},
	linksListContainer: {
		overflowY: 'auto',
	},
	buttonArea: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
});

function Header() {
	const {
		requestsStore,
		schemas,
		selectSchema,
		selectedSchemaName,
		isSchemaValid,
		invalidLinks,
		boxUpdater,
	} = useSchemaStore();
	const { requestsExist, saveChanges, preparedRequests } = requestsStore;

	const classes = useStyles();

	const [openModal, setOpenModal] = useState(false);

	return (
		<div className={classes.container}>
			{schemas.length !== 0 && (
				<select
					onChange={e => selectSchema(e.target.value)}
					value={selectedSchemaName || undefined}>
					{schemas.map(schema => (
						<option key={schema} value={schema}>
							{schema}
						</option>
					))}
				</select>
			)}
			<button disabled={!requestsExist} className={classes.button} onClick={saveChanges}>
				<span className={requestsExist ? classes.badge : classes.disableBadge}>
					{preparedRequests.length}
				</span>
				Submit changes
			</button>
			{openModal ? (
				<Modal open={openModal} onClose={() => setOpenModal(false)}>
					<div className={classes.modalWindow}>
						<div className={classes.modalWindowContent}>
							<div className={classes.linksListContainer}>
								<InvalidLinkItems invalidLinks={invalidLinks} />
							</div>

							<div className={classes.buttonArea}>
								<button
									onClick={() => {
										deleteInvalidLinks(invalidLinks, boxUpdater);
										setOpenModal(false);
									}}>
									Delete invalid links
								</button>
							</div>
						</div>
					</div>
				</Modal>
			) : (
				<></>
			)}
			<button
				disabled={isSchemaValid}
				className={classes.button}
				onClick={() => setOpenModal(true)}>
				{isSchemaValid ? 'valid' : 'schema is not valid'}
			</button>
		</div>
	);
}

export default observer(Header);
