/** *****************************************************************************
 * Copyright 2020-2021 Exactpro (Exactpro Systems Limited)
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

import { ReactNode, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';

const pane = {
	display: 'grid',
	gap: '3px',
	height: '100%',
	width: '100%',
	position: 'relative',
	overflow: 'hidden',
};

const panePart = {
	height: '100%',
	width: '100%',
	position: 'relative',
	overflow: 'hidden',
};

const preview = {
	display: 'grid',
	gap: '3px',
	height: '100%',
	width: '100%',
	position: 'absolute',
	overflow: 'hidden',
	top: '0',
	left: '0',
	zIndex: '100',
};

const previewPart = {
	height: '100%',
	width: '100%',
	position: 'relative',
	overflow: 'hidden',
	background: 'rgba(138, 138, 138, 0.5)',
	borderRadius: '20px',
};

const splitter = {
	gridArea: 'splitter',
	position: 'relative',
	transition: '250ms',
	borderRadius: '15px',
	'&:hover': {
		background: 'rgb(0, 0, 0, 0.1)',
	},
	'&:active': {
		background: 'rgb(0, 0, 0, 0.2)',
	},
};

const useStyles = createUseStyles({
	verticalSplitPane: {
		gridTemplateAreas: `
             "first"
             "splitter"
             "second"
         `,
		gridTemplateRows: '1fr 16px 1fr',
		gridTemplateColumns: '1fr',
		...pane,
	},
	horizontalSplitPane: props => ({
		gridTemplateAreas: `
             "first splitter second"
         `,
		gridTemplateRows: '1fr',
		gridTemplateColumns: '1fr 16px 1fr',
		...pane,
	}),
	verticalSplitPreview: props => ({
		gridTemplateAreas: `
             "first"
             "splitter"
             "second"
         `,
		gridTemplateRows: '1fr 16px 1fr',
		gridTemplateColumns: '1fr',
		cursor: 'row-resize',
		...preview,
	}),
	horizontalSplitPreview: props => ({
		gridTemplateAreas: `
             "first splitter second"
         `,
		gridTemplateRows: '1fr',
		gridTemplateColumns: '1fr 16px 1fr',
		cursor: 'col-resize',
		...preview,
	}),
	splitPreviewFirst: {
		gridArea: 'first',
		...previewPart,
	},
	splitPreviewSecond: {
		gridArea: 'second',
		...previewPart,
	},
	splitPaneFirst: {
		gridArea: 'first',
		...panePart,
	},
	splitPaneSecond: {
		gridArea: 'second',
		...panePart,
	},
	verticalSplitter: {
		cursor: 'row-resize',
		'&:before, &:after': {
			content: '""',
			position: 'absolute',
			left: 'calc(50% - 15px)',
			width: '30px',
			height: '1px',
			display: 'block',
			background: 'rgb(0, 0, 0, 0.5)',
		},
		'&:before': {
			top: '45%',
		},
		'&:after': {
			top: '55%',
		},
		...splitter,
	},
	horizontalSplitter: {
		cursor: 'col-resize',
		'&:before, &:after': {
			content: '""',
			position: 'absolute',
			top: 'calc(50% - 15px)',
			width: '1px',
			height: '30px',
			display: 'block',
			background: 'rgb(0, 0, 0, 0.5)',
		},
		'&:before': {
			left: '45%',
		},
		'&:after': {
			left: '55%',
		},
		...splitter,
	},
});

export interface Props {
	first: ReactNode;
	second: ReactNode;
	isVertical?: boolean;
	firstMinSize?: number;
	secondMinSize?: number;
}

function SplitPane({
	first,
	second,
	isVertical = false,
	firstMinSize = 0,
	secondMinSize = 0,
}: Props) {
	const [isDragging, setIsDragging] = useState(false);
	const [startMousePos, setStartMousePos] = useState({ x: 0, y: 0 });

	const root = useRef<HTMLDivElement>(null);
	const preview = useRef<HTMLDivElement>(null);

	const updateStyles = useCallback(
		(el: RefObject<HTMLElement>, offset: number): void => {
			if (el.current) {
				if (!isVertical) {
					el.current.style.gridTemplateColumns = `minmax(${firstMinSize}px, ${offset}%) 16px  minmax(${secondMinSize}px, 1fr)`;
					el.current.style.gridTemplateRows = '1fr';
				} else {
					el.current.style.gridTemplateRows = `minmax(${firstMinSize}px, ${offset}%) 16px  minmax(${secondMinSize}px, 1fr)`;
					el.current.style.gridTemplateColumns = '1fr';
				}
			}
		},
		[firstMinSize, isVertical, secondMinSize],
	);

	console.log('++');

	const classes = useStyles();

	const splitterMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		if (root.current) {
			root.current.addEventListener('mousemove', onMouseMove, { passive: true });
			root.current.addEventListener('mouseleave', onMouseUpOrLeave, { passive: true });
			root.current.addEventListener('mouseup', onMouseUpOrLeave, { passive: true });

			setIsDragging(true);
			// updateStyles(preview, getOffset(e.clientX, e.clientY));
			setStartMousePos({ x: e.clientX, y: e.clientY });
		}
	};

	const getOffset = useCallback(
		(x: number, y: number): number => {
			const splitterOffset = 8;

			const clientRect = root.current!.getBoundingClientRect();
			const moveValue = { x: x - clientRect.left, y: y - clientRect.top };
			if (isVertical) {
				return ((moveValue.y - splitterOffset) / root.current!.offsetHeight) * 100;
			} else {
				return ((moveValue.x - splitterOffset) / root.current!.offsetWidth) * 100;
			}
		},
		[isVertical],
	);

	useEffect(() => {
		if (isDragging) {
			updateStyles(preview, getOffset(startMousePos.x, startMousePos.y));
		}
	}, [getOffset, isDragging, startMousePos.x, startMousePos.y, updateStyles]);

	const onMouseMove = (e: MouseEvent) => {
		updateStyles(preview, getOffset(e.clientX, e.clientY));
	};

	const onMouseUpOrLeave = (e: MouseEvent) => {
		if (root.current) {
			root.current.removeEventListener('mousemove', onMouseMove);
			root.current.removeEventListener('mouseup', onMouseUpOrLeave);
			root.current.removeEventListener('mouseleave', onMouseUpOrLeave);
		}
		setIsDragging(false);
		updateStyles(root, getOffset(e.clientX, e.clientY));
	};

	return (
		<div
			className={isVertical ? classes.verticalSplitPane : classes.horizontalSplitPane}
			ref={root}>
			{isDragging ? (
				<div
					ref={preview}
					className={isVertical ? classes.verticalSplitPreview : classes.horizontalSplitPreview}>
					<div className={classes.splitPreviewFirst} />
					<div className={classes.splitPreviewSecond} />
				</div>
			) : null}
			<div className={classes.splitPaneFirst}>{first}</div>
			<div
				className={isVertical ? classes.verticalSplitter : classes.horizontalSplitter}
				onMouseDown={splitterMouseDown}
			/>
			<div className={classes.splitPaneSecond}>{second}</div>
		</div>
	);
}

export default SplitPane;
