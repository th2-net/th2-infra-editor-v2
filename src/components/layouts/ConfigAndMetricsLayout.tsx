import { createUseStyles } from 'react-jss';
import Config from '../config';
import Metrics from '../Metrics';

const useStyles = createUseStyles({
	container: {
		display: 'grid',
		gridTemplateAreas: `
		"config metrics"
		`,
		gridTemplateRows: '1fr ',
		gridTemplateColumns: '1fr 1fr',
		gap: 8,
		height: '100%',
		overflow: 'auto',
	},
});

function ConfigAndMetricsLayout() {
	const classes = useStyles();

	return (
		<div className={classes.container}>
			<Config />
			<Metrics />
		</div>
	);
}

export default ConfigAndMetricsLayout;
