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
import { createUseStyles } from 'react-jss';
import { useSchemaStore } from '../hooks/useSchemaStore';
import { useEffect, useState } from 'react';
import warningIcon from '../assets/icons/attention-error.svg';
import CustomizedTooltip from './util/CustomizedTooltip';
import ModalConfirmation from './util/ModalConfirmation';
import InvalidLinksList from './util/InvalidLinksList';
import { button } from '../styles/mixins';

const useStyles = createUseStyles({
	button: {
		...button(),
		color: '#fff',
		margin: '0 25px',
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
	},
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
	invalidSchemaIndicator: {
		display: 'grid',
		gridTemplateColumns: '20px auto',
		gridColumnGap: 3,
		backgroundColor: 'orange',
		borderRadius: 4,
		color: 'white',
		padding: 3,
		cursor: 'pointer',
	},
	warningIcon: {
		width: 20,
		height: 20,
		backgroundImage: `url(${warningIcon})`,
		backgroundSize: '100%',
		placeSelf: 'center',
		backgroundRepeat: 'no-repeat',
	},
});

function Header() {
	const { requestsStore, schemas, selectSchema, selectedSchemaName, isSchemaValid, boxesStore } =
		useSchemaStore();
	const { requestsExist, saveChanges, preparedRequests, discardChanges } = requestsStore;

	const classes = useStyles();

	const [openModal, setOpenModal] = useState(false);

	const [openConfirmationModal, setOpenConfirmationModal] = useState(false);

	const [confirmationModalType, setConfirmationModalType] = useState<'save' | 'discard' | null>(
		null,
	);

	const confirmationModalConfig = {
		save: {
			setOpen: setOpenConfirmationModal,
			message: 'Do you want to submit pending changes?',
			action: saveChanges,
		},
		discard: {
			setOpen: setOpenConfirmationModal,
			message: 'Do you want to discard pending changes?',
			action: discardChanges,
		},
	};

	useEffect(() => {
		setOpenModal(false);
	}, [boxesStore.selectedBox]);

	return (
		<div className={classes.container}>
			{schemas.length !== 0 && (
				<CustomizedTooltip title='submit pending changes first' disableCondition={!requestsExist}>
					<select
						disabled={requestsExist}
						onChange={e => selectSchema(e.target.value)}
						value={selectedSchemaName || undefined}
					>
						{schemas.map(schema => (
							<option key={schema} value={schema}>
								{schema}
							</option>
						))}
					</select>
				</CustomizedTooltip>
			)}
			<button
				disabled={!requestsExist}
				className={classes.button}
				onClick={() => {
					setOpenConfirmationModal(true);
					setConfirmationModalType('save');
				}}
			>
				<span className={requestsExist ? classes.badge : classes.disableBadge}>
					{preparedRequests.length}
				</span>
				Submit changes
			</button>
			{requestsExist && (
				<button
					className={classes.button}
					onClick={() => {
						setOpenConfirmationModal(true);
						setConfirmationModalType('discard');
					}}
				>
					Discard changes
				</button>
			)}
			{openConfirmationModal && confirmationModalType && (
				<ModalConfirmation {...confirmationModalConfig[confirmationModalType]} />
			)}
			{openModal && <InvalidLinksList setOpen={setOpenModal} />}
			{!isSchemaValid && (
				<div className={classes.invalidSchemaIndicator} onClick={() => setOpenModal(true)}>
					<div className={classes.warningIcon}></div>
					<div>schema is not valid</div>
				</div>
			)}
		</div>
	);
}

export default observer(Header);
