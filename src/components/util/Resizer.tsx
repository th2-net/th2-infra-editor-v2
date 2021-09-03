import { useEffect } from 'react';
import { useState } from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
	bottom: {
		position: 'absolute',
		cursor: 'ns-resize',
		width: '100%',
		height: '4px',
		zIndex: 1,
		bottom: 0,
		left: 0,
	},
});

interface Props {
	onResize: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Resizer = ({ onResize }: Props) => {
	const classes = useStyles();
	const [mouseDown, setMouseDown] = useState(false);

	const handleMouseDown = () => {
		setMouseDown(true);
	};

	useEffect(() => {
		const handleMouseMove = (e: { movementY: any }) => {
			onResize(e.movementY);
		};

		if (mouseDown) {
			window.addEventListener('mousemove', handleMouseMove);
		}
		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
		};
	}, [mouseDown, onResize]);

	useEffect(() => {
		const handleMouseUp = () => setMouseDown(false);
		window.addEventListener('mouseup', handleMouseUp);

		return () => {
			window.removeEventListener('mouseup', handleMouseUp);
		};
	}, []);

	return (
		<>
			<div className={classes.bottom} onMouseDown={handleMouseDown}></div>
		</>
	);
};

export default Resizer;
