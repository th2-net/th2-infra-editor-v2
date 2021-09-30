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

import React from 'react';
import { createUseStyles } from 'react-jss';
import Size from '../../util/Size';

const useStyles = createUseStyles({
	container: {
		width: '100%',
		height: '100%',
		overflow: 'hidden',
	},
});

type Props = {
	onWidthChange?: (width: number) => void;
	onHeightChange?: (height: number) => void;
	onSizeChange?: (size: Size) => void;
	children: React.ReactNode;
};

const ResizeDetector = ({ onWidthChange, onHeightChange, onSizeChange, children }: Props) => {
	const classes = useStyles();
	const rootRef = React.useRef<HTMLDivElement | null>(null);
	const oldSize = React.useRef<Size>({ width: 0, height: 0 });

	const onResize: ResizeObserverCallback = React.useCallback(
		entries => {
			const { width: newWidth, height: newHeight } = entries[0].contentRect;

			const widthChanged = newWidth !== oldSize.current.width;
			const heightChanged = newHeight !== oldSize.current.height;

			if (widthChanged) {
				oldSize.current.width = newWidth;
				onWidthChange?.(newWidth);
			}

			if (heightChanged) {
				oldSize.current.height = newHeight;
				onHeightChange?.(newHeight);
			}

			onSizeChange?.({ width: newWidth, height: newHeight });
		},
		[onWidthChange, onHeightChange, onSizeChange],
	);

	React.useEffect(() => {
		const resizeObserver = new ResizeObserver(onResize);
		const rootElement = rootRef.current as Element;

		resizeObserver.observe(rootElement);

		return () => {
			resizeObserver.unobserve(rootElement);
		};
	}, [onResize]);

	return (
		<div className={classes.container} ref={rootRef}>
			{children}
		</div>
	);
};

export default ResizeDetector;
