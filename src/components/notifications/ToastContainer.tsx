import React from 'react';
import { ToastContainerProps } from 'react-toast-notifications';
import { createUseStyles } from 'react-jss';
import notificationsStore from '../../stores/NotificationsStore';
import closeIcon from '../../assets/icons/close-icon.svg';

const useStyle = createUseStyles({
	'@keyframes fade-in': {
		from: {
			opacity: 0,
		},
		to: {
			opacity: 1,
		},
	},
	'@keyframes move-down': {
		from: {
			transform: 'translateY(-15px)',
		},
		to: {
			transform: 'translateY(0)',
		},
	},
	container: {
		width: '70%',
		maxWidth: '500px',
		boxSizing: 'border-box',
		maxHeight: '100%',
		position: 'fixed',
		zIndex: 1000,
		top: 0,
		right: 0,
		display: 'flex',
	},
	closeIcon: {
		position: 'absolute',
		top: '10px',
		left: '-17px',
		height: '20px',
		width: '20px',
		minWidth: '20px',
		border: 'none',
		backgroundColor: 'transparent',
		cursor: 'pointer',
		background: {
			image: `url(${closeIcon})`,
			repeat: 'no-repeat',
			size: '100%',
			position: 'center',
		},
	},
	list: {
		maxHeight: '100%',
		width: '100%',
		overflowX: 'hidden',
		overflowY: 'auto',
		padding: '8px',
	},
});

function ToastContainer(props: ToastContainerProps) {
	const { hasToasts, children } = props;
	const styles = useStyle();

	if (!hasToasts) return null;

	return (
		<div className={styles.container}>
			<div
				className={styles.closeIcon}
				title='Close all'
				onClick={() => notificationsStore.clearAll()}
			/>
			<div className={styles.list}>{children}</div>
		</div>
	);
}

export default ToastContainer;
