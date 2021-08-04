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

import { useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';

interface StylesProps {
	rows: string;
	columns: string;
	rowsPreview: string;
	columnsPreview: string;
}

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

const useStyles = createUseStyles<string, StylesProps>({
	verticalSplitPane: props => ({
		gridTemplateAreas: `
             "first"
             "splitter"
             "second"
         `,
		gridTemplateRows: props.columns,
		gridTemplateColumns: props.rows,
		...pane,
	}),
	horizontalSplitPane: props => ({
		gridTemplateAreas: `
             "first splitter second"
         `,
		gridTemplateRows: props.rows,
		gridTemplateColumns: props.columns,
		...pane,
	}),
	verticalSplitPreview: props => ({
		gridTemplateAreas: `
             "first"
             "splitter"
             "second"
         `,
		gridTemplateRows: props.columnsPreview,
		gridTemplateColumns: props.rowsPreview,
		cursor: 'row-resize',
		...preview,
	}),
	horizontalSplitPreview: props => ({
		gridTemplateAreas: `
             "first splitter second"
         `,
		gridTemplateRows: props.rowsPreview,
		gridTemplateColumns: props.columnsPreview,
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
	first: React.ReactNode;
	second: React.ReactNode;
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
	const [offset, setOffset] = useState(50);
	const [offsetPreview, setOffsetPreview] = useState(50);
	const [isDragging, setIsDragging] = useState(false);

	const stylesProps = useMemo<StylesProps>(() => {
		return {
			rows: '1fr',
			columns: `minmax(${firstMinSize}px, ${offset}%) 16px minmax(${secondMinSize}px, 1fr)`,
			rowsPreview: '1fr',
			columnsPreview: `minmax(${firstMinSize}px, ${offsetPreview}%) 16px  minmax(${secondMinSize}px, 1fr)`,
		};
	}, [offset, offsetPreview, firstMinSize, secondMinSize]);

	const classes = useStyles(stylesProps);

	const root = useRef<HTMLDivElement>(null);

	const splitterMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		if (root.current) {
			root.current.addEventListener('mousemove', onMouseMove);
			root.current.addEventListener('mouseleave', onMouseUpOrLeave);
			root.current.addEventListener('mouseup', onMouseUpOrLeave);
		}

		setIsDragging(true);
	};

	const getOffset = (x: number, y: number): number => {
		const splitterOffset = 8;

		const clientRect = root.current!.getBoundingClientRect();
		const moveValue = { x: x - clientRect.left, y: y - clientRect.top };
		if (isVertical) {
			return ((moveValue.y - splitterOffset) / root.current!.offsetHeight) * 100;
		} else {
			return ((moveValue.x - splitterOffset) / root.current!.offsetWidth) * 100;
		}
	};

	const onMouseMove = (e: MouseEvent) => {
		setOffsetPreview(getOffset(e.clientX, e.clientY));
	};

	const onMouseUpOrLeave = (e: MouseEvent) => {
		if (root.current) {
			root.current.removeEventListener('mousemove', onMouseMove);
			root.current.removeEventListener('mouseup', onMouseUpOrLeave);
			root.current.removeEventListener('mouseleave', onMouseUpOrLeave);
		}
		setIsDragging(false);
		setOffset(getOffset(e.clientX, e.clientY));
	};

	return (
		<div
			className={isVertical ? classes.verticalSplitPane : classes.horizontalSplitPane}
			ref={root}>
			{isDragging ? (
				<div className={isVertical ? classes.verticalSplitPreview : classes.horizontalSplitPreview}>
					<div className={classes.splitPreviewFirst} />
					<div className={classes.splitPreviewSecond} />
				</div>
			) : null}
			<div className={classes.splitPaneFirst}>{first}</div>
			<div
				className={isVertical ? classes.verticalSplitter : classes.horizontalSplitter}
				onMouseDown={splitterMouseDown}></div>
			<div className={classes.splitPaneSecond}>{second}</div>
		</div>
	);
}

export default SplitPane;
