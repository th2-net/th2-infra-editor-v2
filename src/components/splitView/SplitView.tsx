import React, { ReactNode } from 'react';
import { createUseStyles } from 'react-jss';

type SplitViewProps = {
	topComponent: React.ReactNode;
	bottomComponent: React.ReactNode;
	splitter: React.ReactNode;
};

type StylesProps = {
	topComponentHeight: number;
	isDragging: boolean;
};

const useStyles = createUseStyles<string, StylesProps>({
	container: {
		display: 'grid',

		gridTemplateRows: ({ topComponentHeight }) => `${topComponentHeight}px 15px 1fr`,
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

function SplitView({ topComponent, bottomComponent, splitter }: SplitViewProps) {
	const rootRef = React.useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = React.useState(false);
	const [topComponentHeight, setTopComponentHeight] = React.useState(200);
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
			<div className={classes.splitter} onMouseDown={splitterMouseDown}>
				{splitter}
			</div>
			<div className={classes.panel}>{bottomComponent}</div>
		</div>
	);
}

export default SplitView;
