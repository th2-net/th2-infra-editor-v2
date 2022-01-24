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

import React from 'react';
import { createPortal } from 'react-dom';
import { createUseStyles } from 'react-jss';

type StylesProps = {
	isShown: boolean;
};

const useStyles = createUseStyles<string, StylesProps>({
	modalBackground: {
		visibility: ({ isShown }) => `${isShown} ? 'visible' : 'hidden' `,
		zIndex: 1000,
		width: '100%',
		height: '100%',
		position: 'fixed',
		backgroundColor: 'rgba(0,0,0,0.4)',
		left: 0,
		top: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
});

interface ModalPortalProps {
	closeDelay?: number;
	children: React.ReactNode;
	isOpen: boolean;
}

export const ModalPortal = React.forwardRef<HTMLDivElement, ModalPortalProps>(
	({ closeDelay = 0, children, isOpen }, ref) => {
		const [isShown, setIsShown] = React.useState(false);
		const closeTimeout = React.useRef<number | null>(null);
		const classes = useStyles({ isShown });

		React.useEffect(() => {
			if (!isOpen && closeDelay !== 0) {
				closeTimeout.current = window.setTimeout(() => {
					setIsShown(isOpen);
				}, closeDelay);
				return;
			}

			setIsShown(isOpen);
			if (closeTimeout.current) {
				window.clearTimeout(closeTimeout.current);
			}
		}, [isOpen]);

		return createPortal(
			<div ref={ref} className={classes.modalBackground}>
				{children}
			</div>,
			document.body,
		);
	},
);

ModalPortal.displayName = 'ModalPortal';
