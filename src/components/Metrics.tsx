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

import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDebouncedCallback } from 'use-debounce/lib';
import { useBoxesStore } from '../hooks/useBoxesStore';
import { useInput } from '../hooks/useInput';
import { useSchemaStore } from '../hooks/useSchemaStore';
import { scrollBar, visuallyHidden } from '../styles/mixins';
import Input from './util/Input';

const useStyles = createUseStyles({
	container: {
		overflowY: 'hidden',
		border: 'none',
		borderRadius: 24,
		padding: 24,
		backgroundColor: '#FFF',
		boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.16)',
		...scrollBar(),
	},
	header: {
		width: '100%',
		fontWeight: 700,
		fontSize: '16px',
		marginBottom: 16,
	},
	content: {
		height: '250px',
		marginBottom: 24,
	},
	metrics: {
		height: '100%',
		width: '100%',
		border: 'none',
		borderRadius: '4px',
	},
	logs: {
		height: 'calc(100% - 40px)',
		width: '100%',
		border: 'none',
		borderRadius: '6px',
	},
	input: {
		color: 'rgba(51, 51, 51, 0.6)',
		marginBottom: 24,
	},
});

function Metrics() {
	const classes = useStyles();
	const schemaStore = useSchemaStore();
	const boxesStore = useBoxesStore();

	const [filter, setFilter] = useState<MetricsFilters>('cpuUsage');

	const search = useInput({
		initialValue: '',
		id: 'search',
		label: 'Search',
	});

	const [component, setComponent] = useState<string>('');
	const [searchDebouncedValue, setSearchDebouncedValue] = useState<string>('');

	const options =
		schemaStore.selectedSchema && `var-namespace=th2-${schemaStore.selectedSchemaName}&theme=light`;

	const logsOptions = useMemo(() => {
		if (component === '') {
			return null;
		}

		return `orgId=1&refresh=10s&${options}&var-component=${component}&var-search=${searchDebouncedValue}&panelId=8`;
	}, [options, component, searchDebouncedValue]);

	const setDebouncedValue = useDebouncedCallback((value: string) => {
		setSearchDebouncedValue(value);
	}, 600);

	const metricsOptions = useMemo(() => {
		if (component === '') {
			return null;
		}

		return `orgId=1&refresh=5s&var-datasource=Prometheus&${options}&var-workload=${component}&var-type=deployment`;
	}, [options, component]);

	useEffect(() => {
		setDebouncedValue(search.value);
	}, [search.value, setDebouncedValue]);

	useEffect(() => {
		setComponent(boxesStore.selectedBox?.name || '');
	}, [boxesStore.selectedBox]);

	if (!options || !logsOptions || !metricsOptions) return null;

	return (
		<div className={classes.container}>
			<div className={classes.header}>Metrics</div>
			<MetricsFilter filter={filter} setFilter={setFilter} />
			{filter === 'cpuUsage' ? (
				<div className={classes.content}>
					<iframe
						title={component}
						className={classes.metrics}
						src={`/grafana/d-solo/b164a7f0339f99f89cea5cb47e9be618/kubernetes-compute-resources-workload-5-second-update-interval?${metricsOptions}&panelId=1`}
					/>
				</div>
			) : filter === 'memoryUsage' ? (
				<div className={classes.content}>
					<iframe
						title={component}
						className={classes.metrics}
						src={`grafana/d-solo/b164a7f0339f99f89cea5cb47e9be618/kubernetes-compute-resources-workload-5-second-update-interval?${metricsOptions}&panelId=3`}
					/>
				</div>
			) : (
				<div className={classes.content}>
					<div className={classes.input}>
						<Input inputConfig={search} />
					</div>
					<iframe
						title={component}
						className={classes.logs}
						src={`grafana/d-solo/logs/logs?${logsOptions}`}
					/>
				</div>
			)}
		</div>
	);
}

export default observer(Metrics);

type MetricsFilters = 'cpuUsage' | 'memoryUsage' | 'logs';

interface FiltersProps {
	filter: MetricsFilters;
	setFilter: (filter: MetricsFilters) => void;
}

const useMetricsFiltersStyles = createUseStyles({
	filters: {
		display: 'flex',
		marginBottom: 16,
		lineHeight: '16px',
		height: '32px',
		fontSize: '12px',
		color: '#333333',
		borderRadius: 4,
		gap: 12,
	},
	filtersInput: {
		...visuallyHidden(),
		'&:checked': {
			'&+label': {
				backgroundColor: '#5CBEEF',
				color: '#FFF',
				border: '1px solid #0099E5',
				boxSizing: 'border-box',
			},
		},
	},
	filtersLabel: {
		display: 'inline-flex',
		backgroundColor: '#F3F3F6',
		verticalAlign: 'middle',
		padding: '8px 12px',
		border: '1px solid #E5E5E5',
		borderRadius: 4,
		cursor: 'pointer',
	},
});

function MetricsFilter({ filter, setFilter }: FiltersProps) {
	const classes = useMetricsFiltersStyles();
	return (
		<div className={classes.filters}>
			<input
				className={classes.filtersInput}
				type='radio'
				name='metricsFilter'
				onClick={() => {
					setFilter('cpuUsage');
				}}
				id='cpuUsage'
				checked={filter === 'cpuUsage'}
			/>
			<label title='CPU Usage' htmlFor='cpuUsage' className={classes.filtersLabel}>
				CPU Usage
			</label>
			<input
				className={classes.filtersInput}
				type='radio'
				name='metricsFilter'
				onClick={() => {
					setFilter('memoryUsage');
				}}
				id='memoryUsage'
				checked={filter === 'memoryUsage'}
			/>
			<label title='Memory Usage' htmlFor='memoryUsage' className={classes.filtersLabel}>
				Memory Usage
			</label>
			<input
				className={classes.filtersInput}
				type='radio'
				name='metricsFilter'
				id='logs'
				onClick={() => {
					setFilter('logs');
				}}
				checked={filter === 'logs'}
			/>
			<label title='Logs' htmlFor='logs' className={classes.filtersLabel}>
				Logs
			</label>
		</div>
	);
}
