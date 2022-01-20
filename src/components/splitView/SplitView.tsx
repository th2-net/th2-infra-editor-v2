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

type SplitViewProps = {
	topComponent: React.ReactNode;
	bottomComponent: React.ReactNode;
};

type StylesProps = {
	topComponentHeight: number;
	isDragging: boolean;
};

const useStyles = createUseStyles<string, StylesProps>({
	container: {
		display: 'grid',
		height: '100%',
		overflow: 'hidden',

		gridTemplateRows: ({ topComponentHeight }) => `${topComponentHeight}px 40px 1fr`,
	},

	splitter: {
		cursor: 'row-resize',
	},

	panel: {
		position: 'relative',
		overflow: 'hidden',
		borderRadius: '6px',

		'&:after': {
			content: "''",
			position: 'absolute',
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,

			cursor: ({ isDragging }) => (isDragging ? 'row-resize' : 'default'),
			display: ({ isDragging }) => (isDragging ? 'block' : 'none'),
		},
	},
});

type MouseEvents = {
	onMouseUp: (e: MouseEvent) => void;
	onMouseMove: (e: MouseEvent) => void;
};

function SplitView({ topComponent, bottomComponent }: SplitViewProps) {
	const rootRef = React.useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = React.useState(false);
	const [topComponentHeight, setTopComponentHeight] = React.useState(280);
	const [mouseEvents, setMouseEvents] = React.useState<MouseEvents | null>(null);

	const startY = React.useRef(0);
	const lastTopComponentHeight = React.useRef(topComponentHeight);

	const classes = useStyles({ isDragging, topComponentHeight });

	const splitterMouseDown = (e: React.MouseEvent) => {
		setIsDragging(true);
		lastTopComponentHeight.current = topComponentHeight;
		startY.current = e.pageY;
		e.preventDefault();
	};

	const onMouseUp = React.useCallback(() => {
		setIsDragging(false);
	}, []);

	const onMouseMove = React.useCallback((e: MouseEvent) => {
		if (rootRef.current) {
			const newHeight = lastTopComponentHeight.current - startY.current + e.pageY;

			const nonNegativeHeight = Math.max(newHeight, 0);

			const maxHeight = rootRef.current.getBoundingClientRect().height - 15;

			const limitedHeight = Math.min(nonNegativeHeight, maxHeight);

			setTopComponentHeight(limitedHeight);
		}
	}, []);

	const setupEvents = React.useCallback(() => {
		document.addEventListener('mouseup', onMouseUp);
		document.addEventListener('mousemove', onMouseMove);

		setMouseEvents({ onMouseUp, onMouseMove });
	}, [onMouseUp, onMouseMove]);

	const disposeEvents = React.useCallback(() => {
		if (mouseEvents) {
			document.removeEventListener('mouseup', mouseEvents.onMouseUp);
			document.removeEventListener('mousemove', mouseEvents.onMouseMove);

			setMouseEvents(null);
		}
	}, [mouseEvents]);

	React.useEffect(() => {
		if (isDragging && !mouseEvents) setupEvents();

		return () => {
			if (isDragging && mouseEvents) {
				disposeEvents();
			}
		};
	});

	return (
		<div className={classes.container} ref={rootRef}>
			<div className={classes.panel}>{topComponent}</div>
			<div className={classes.splitter} onMouseDown={splitterMouseDown}></div>
			<div className={classes.panel}>{bottomComponent}</div>
		</div>
	);
}

export default SplitView;
