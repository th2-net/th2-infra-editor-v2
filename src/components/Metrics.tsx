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
import { cpuPanel, memoryPanel, logsPanel } from '../api/grafanaPaths.json';
import Input from './util/Input';

const useStyles = createUseStyles({
	container: {
		border: '1px solid',
		borderRadius: '6px',
	},
	metricsSection: {
		'&:not(:first-child)': {
			margin: '10px 0 0',
		},
		height: '33%',
		borderRadius: '6px',
	},
	metrics: {
		height: '100%',
		width: '100%',
		border: 'none',
		borderRadius: '6px',
	},
	logs: {
		height: 'calc(100% - 40px)',
		width: '100%',
		border: 'none',
		borderRadius: '6px',
	},
});

function Metrics() {
	const classes = useStyles();
	const schemaStore = useSchemaStore();
	const boxesStore = useBoxesStore();

	const search = useInput({
		initialValue: '',
		id: 'search',
		label: 'Search',
	});

	const [createDashboard, setCreateDashboard] = useState(false);
	const [component, setComponent] = useState<string>('');
	const [searchDebouncedValue, setSearchDebouncedValue] = useState<string>('');

	const options =
		schemaStore.selectedSchema && `var-namespace=th2-${schemaStore.selectedSchemaName}&theme=light`;

	const logsOptions = useMemo(() => {
		if (component === '') {
			return null;
		}

		return `orgId=1&refresh=10s&${options}&var-workload=${component}&var-search=${searchDebouncedValue}&panelId=8`;
	}, [options, component, searchDebouncedValue]);

	const setDebouncedValue = useDebouncedCallback((value: string) => {
		setSearchDebouncedValue(value);
	}, 600);

	const tryGetDashboard = () => {
		fetch('grafana/api/dashboards/uid/rHLPJ0K7k')
			.then(res => {
				if (!res.ok) {
					setCreateDashboard(true);
				} else {
					setCreateDashboard(false);
				}
			})
			.catch(() => setCreateDashboard(true))
	}

	const metricsOptions = useMemo(() => {
		if (component === '') {
			return null;
		}

		return `orgId=1&refresh=5s&var-datasource=Prometheus&${options}&var-workload=${component}&var-type=deployment`;
	}, [options, component]);

	useEffect(tryGetDashboard, [])

	useEffect(() => {
		setDebouncedValue(search.value);
	}, [search.value, setDebouncedValue]);

	useEffect(() => {
		setComponent(boxesStore.selectedBox?.name || '');
	}, [boxesStore.selectedBox]);

	if (!options || !logsOptions || !metricsOptions) return null;

	return (
		<div className={classes.container}>
			{
				createDashboard 
				? <>
					<p>There is something wrong with grafana dashboard. Please, follow <a href="https://github.com/th2-net/th2-infra-editor-v2/README.md" target="_blank" rel="noopener noreferrer">this</a> instructions.</p>
					<button onClick={tryGetDashboard}>Try again</button>
				</> 
				: <>
					<section className={classes.metricsSection}>
						<iframe
							title={component}
							className={classes.metrics}
							src={`${cpuPanel}?${metricsOptions}`}
						/>
					</section>
					<section className={classes.metricsSection}>
						<iframe
							title={component}
							className={classes.metrics}
							src={`${memoryPanel}?${metricsOptions}`}
						/>
					</section>
					<section className={classes.metricsSection}>
						<Input inputConfig={search} />
						<iframe
							title={component}
							className={classes.logs}
							src={`${logsPanel}?${logsOptions}`}
						/>
					</section>
				</>
			}
		</div>
	);
}

export default observer(Metrics);
