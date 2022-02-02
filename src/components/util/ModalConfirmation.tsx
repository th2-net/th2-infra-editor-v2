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

import classNames from 'classnames';
import React, { Dispatch, SetStateAction } from 'react';
import { createUseStyles } from 'react-jss';
import { modalWindow } from '../../styles/mixins';
import { ModalPortal } from './Portal';

const useStyles = createUseStyles({
	modalWindow: {
		...modalWindow(),
		width: 325,
		height: 192,
	},
	header: {
		fontSize: 18,
		fontWeight: 500,
	},
	messageContainer: {
		fontSize: 16,
		fontWeight: 400,
	},
	buttonArea: {
		display: 'flex',
		gap: '12px',
		justifyContent: 'center',
	},
	button: {
		width: '90px',
		borderRadius: '4px',
		color: '#fff',
		padding: '12px 24px',
		textTransform: 'capitalize',
		outline: 'none',
		border: 'none',
		fontSize: '14px',
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
	},
	cancel: {
		backgroundColor: '#4E4E4E',
	},
});

const ModalConfirmation = (props: {
	setOpen: Dispatch<SetStateAction<boolean>>;
	isOpen: boolean;
	action: () => void;
	header: string;
	message: string;
}) => {
	const classes = useStyles();
	return (
		<ModalPortal isOpen={props.isOpen}>
			<div className={classes.modalWindow}>
				<div className={classes.header}>{props.header}</div>
				<div className={classes.messageContainer}>{props.message}</div>
				<div className={classes.buttonArea}>
					<button
						className={classes.button}
						onClick={() => {
							props.action();
							props.setOpen(false);
						}}>
						Yes
					</button>
					<button
						className={classNames(classes.button, classes.cancel)}
						onClick={() => {
							props.setOpen(false);
						}}>
						No
					</button>
				</div>
			</div>
		</ModalPortal>
	);
};

export default ModalConfirmation;
