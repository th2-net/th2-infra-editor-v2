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

import { Dispatch, SetStateAction } from 'react';
import { createUseStyles } from 'react-jss';
import { useSchemaStore } from '../../hooks/useSchemaStore';
import { deleteInvalidLinks } from '../../helpers/pinConnections';
import { InvalidLinkItems } from './InvalidLink';
import ModalWindow from './ModalWindow';
import { modalWindow, button } from '../../styles/mixins';

const useStyles = createUseStyles({
	button: {
		...button(),
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
	modalWindow: {
		...modalWindow(),
		overflow: 'hidden',
		width: '50%',
		height: document.documentElement.scrollHeight / 2,
		display: 'grid',
		gridTemplateRows: '90% 10%',
		gridRowGap: '10px',
	},
	modalWindowContent: {
		display: 'grid',
		gridTemplateRows: '90% 10%',
		gridRowGap: '5px',
		height: '100%',
	},
	linksListContainer: {
		height: '100%',
		overflowY: 'auto',
	},
	buttonArea: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
	},
});

const InvalidLinksList = (props: { setOpen: Dispatch<SetStateAction<boolean>> }) => {
	const { invalidLinks, boxUpdater, boxesStore, updateIsSchemaValid } = useSchemaStore();

	const classes = useStyles();

	return (
		<ModalWindow setOpen={props.setOpen}>
			<div className={classes.modalWindow}>
				<div className={classes.linksListContainer}>
					<InvalidLinkItems invalidLinks={invalidLinks} boxesStore={boxesStore} />
				</div>

				<div className={classes.buttonArea}>
					<button
						className={classes.button}
						onClick={() => {
							deleteInvalidLinks(invalidLinks, boxUpdater);
							props.setOpen(false);
							updateIsSchemaValid();
						}}>
						Delete invalid links
					</button>
				</div>
			</div>
		</ModalWindow>
	);
};

export default InvalidLinksList;
