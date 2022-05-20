import React from 'react';
import { AppearanceTypes, ToastProps, TransitionState } from 'react-toast-notifications';
import { createUseStyles } from 'react-jss';
import closeIcon from '../../assets/icons/close-icon.svg';

const styleTransform = (transitionState: TransitionState) => {
	switch (transitionState) {
		case 'entering':
		case 'exiting':
		case 'exited':
			return 'translate3d(100%, 0, 0) scale(0.9)';
		case 'entered':
		default:
			return 'translate3d(0, 0, 0) scale(1)';
	}
};

const styleBackground = (appearance: AppearanceTypes) => {
	switch (appearance) {
		case 'info':
		case 'success':
		case 'warning':
			return '#4db26f';
		case 'error':
		default:
			return '#ff6666';
	}
};

const useStyles = createUseStyles({
	message: (props: ToastProps) => ({
		display: 'flex',
		justifyContent: 'space-between',
		borderRadius: '8px',
		padding: '16px',
		margin: '0 0 8px',
		transform: styleTransform(props.transitionState),
		backgroundColor: styleBackground(props.appearance),
		transition: 'all 0.4s',
	}),
	close: {
		minWidth: '20px',
		border: 'none',
		backgroundColor: 'transparent',
		cursor: 'pointer',
		height: '20px',
		width: '20px',

		background: {
			image: `url(${closeIcon})`,
			repeat: 'no-repeat',
			size: '100%',
			position: 'center',
		},
	},
	content: {
		flexGrow: 1,
		position: 'relative',
		maxWidth: '84%',
		height: '100%',
		padding: '0 14px',
		':after': {
			content: '',
			position: 'absolute',
			top: 0,
			right: 0,
			width: '1px',
			height: 'inherit',
			backgroundColor: '#fff',
		},
	},
});

export default function Toast(props: ToastProps) {
	const { children, onDismiss } = props;
	const styles = useStyles(props);
	return (
		<div className={styles.message}>
			<div className={styles.content}>{children}</div>
			<button className={styles.close} onClick={() => onDismiss()} />
		</div>
	);
}
