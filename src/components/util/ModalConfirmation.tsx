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

import React, { Dispatch, SetStateAction } from 'react';
import { createUseStyles } from 'react-jss';
import ModalWindow from './ModalWindow';
import { modalWindow } from '../../styles/mixins';

const useStyles = createUseStyles({
	modalWindow: {
		...modalWindow(),
		width: 350,
		height: 150,
	},
	messageContainer: {
		fontSize: 20,
		overflowY: 'auto',
		height: 60,
	},
	buttonArea: {
		height: 50,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		'& button': {
			margin: 5,
			height: 40,
			width: 50,
		},
	},
});

const ModalConfirmation = (props: {
	setOpen: Dispatch<SetStateAction<boolean>>;
	action: () => void;
	message: string;
}) => {
	const classes = useStyles();
	return (
		<ModalWindow setOpen={props.setOpen}>
			<div className={classes.modalWindow}>
				<div className={classes.messageContainer}>{props.message}</div>

				<div className={classes.buttonArea}>
					<button
						onClick={() => {
							props.action();
							props.setOpen(false);
						}}
					>
						Yes
					</button>
					<button
						onClick={() => {
							props.setOpen(false);
						}}
					>
						No
					</button>
				</div>
			</div>
		</ModalWindow>
	);
};

export default ModalConfirmation;
