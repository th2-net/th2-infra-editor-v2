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
import Splitter from './Splitter';
import classNames from 'classnames';

type SplitViewProps = {
	topComponent: React.ReactNode;
	bottomComponent: React.ReactNode;
};

const useStyles = createUseStyles({
	container: {
		display: 'grid',
		height: '100%',
		overflow: 'hidden',
		position: 'relative',
	},

	splitter: {
		cursor: 'row-resize',
	},

	panel: {
		position: 'relative',
		overflow: 'hidden',
		borderRadius: '6px',
	},

	preview: {
		position: 'absolute',
		top: '0',
		left: '0',
		height: '100%',
		width: '100%',
	},

	previewPanel: {
		background: 'rgba(0, 0, 0, 0.25)',
	},

	none: {
		display: 'none',
	},
});

function SplitView({ topComponent, bottomComponent }: SplitViewProps) {
	const rootRef = React.useRef<HTMLDivElement>(null);
	const rootRefPreview = React.useRef<HTMLDivElement>(null);
	const topComponentRef = React.useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = React.useState(false);

	const startY = React.useRef(0);
	const lastTopComponentHeight = React.useRef(0);
	const classes = useStyles();

	const splitterMouseDown = (e: React.MouseEvent) => {
		if (topComponentRef.current) {
			setIsDragging(true);
			startY.current = e.pageY;
			lastTopComponentHeight.current = topComponentRef.current.getBoundingClientRect().height;
			e.preventDefault();
		}
	};

	React.useEffect(() => {
		const calculateHeight = (e: MouseEvent): string => {
			if (!rootRef.current) return '1fr 15px 1fr';
			const newHeight = lastTopComponentHeight.current - startY.current + e.pageY;
			const nonNegativeHeight = Math.max(newHeight, 0);
			const maxHeight = rootRef.current.getBoundingClientRect().height - 15;
			return `${Math.min(nonNegativeHeight, maxHeight)}px 15px 1fr`;
		};

		const onMouseUp = (e: MouseEvent) => {
			setIsDragging(false);
			if (rootRef.current) {
				rootRef.current.style.gridTemplateRows = calculateHeight(e);
			}
		};

		const onMouseMove = (e: MouseEvent) => {
			if (rootRefPreview.current) {
				rootRefPreview.current.style.gridTemplateRows = calculateHeight(e);
			}
		};

		if (isDragging) {
			document.addEventListener('mouseup', onMouseUp);
			document.addEventListener('mousemove', onMouseMove);
		}

		return () => {
			document.removeEventListener('mouseup', onMouseUp);
			document.removeEventListener('mousemove', onMouseMove);
		};
	}, [isDragging]);

	React.useEffect(() => {
		if (isDragging && rootRefPreview.current) {
			rootRefPreview.current.style.gridTemplateRows = `${lastTopComponentHeight.current}px 15px 1fr`;
		}
	}, [isDragging]);

	return (
		<div className={classes.container} ref={rootRef}>
			<div className={classes.panel} ref={topComponentRef}>
				{topComponent}
			</div>
			<div className={classes.splitter} onMouseDown={splitterMouseDown}>
				<Splitter />
			</div>
			<div className={classes.panel}>{bottomComponent}</div>

			{isDragging && (
				<div className={classNames(classes.container, classes.preview)} ref={rootRefPreview}>
					<div className={classNames(classes.panel, classes.previewPanel)} />
					<div className={classes.splitter} />
					<div className={classNames(classes.panel, classes.previewPanel)} />
				</div>
			)}
		</div>
	);
}

export default SplitView;
