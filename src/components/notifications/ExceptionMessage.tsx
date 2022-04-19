/** ****************************************************************************
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

import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { copyTextToClipboard } from '../../helpers/copyHandler';
import toastCopy from '../../assets/icons/toast-copy.svg';

interface ExceptionMessageProps {
	notificationType: 'exceptionMessage';
	message: string;
	type: string;
	id: string;
}

const useStyles = createUseStyles({
	content: {
		color: '#fff',
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		fontSize: '14px',
		fontWeight: 'bold',
		gap: '4px',
		$body: {
			textOverflow: 'ellipsis',
			overflow: 'hidden',
			whiteApace: 'nowrap',
		},
	},
	middle: {
		wordBreak: 'break-all',
		fontSize: '12px',
	},
	body: {},
	code: {},
	action: {
		margin: '4px 0 0',
		display: 'flex',
		backgroundColor: 'transparent',
		color: '#fff',
		cursor: 'pointer',
		border: 'none',
	},
	actionIcon: {
		margin: '0 4px 0 0',
		height: '16px',
		width: '17px',
		background: {
			image: `url(${toastCopy})`,
			repeat: 'no-repeat',
			size: '100%',
			position: 'center',
		},
	},
	text: (props: { copied: boolean }) => ({
		color: props.copied ? 'gray' : 'default',
	}),
	bottom: {
		display: 'flex',
		justifyContent: 'flex-end',
	},
});

export default function ExceptionMessage(props: ExceptionMessageProps) {
	const { id, message, notificationType } = props;
	const [copied, setCopied] = useState(false);
	const styles = useStyles({ copied });

	const copy = () => {
		const value = JSON.stringify({ message, notificationType }, null, ' ');
		copyTextToClipboard(value);
		setCopied(true);
	};

	return (
		<div className={styles.content}>
			<div className={styles.header}>
				<p className={styles.body} title={id}>
					{id}
				</p>
				<p className={styles.code}>{notificationType}</p>
			</div>
			<div className={styles.middle}>{message}</div>
			<div className={styles.bottom}>
				<button className={styles.action} disabled={copied} onClick={copy}>
					{!copied && <span className={styles.actionIcon} />}
					<span className={''}>{copied ? 'Copied' : ' Copy details'}</span>
				</button>
			</div>
		</div>
	);
}
