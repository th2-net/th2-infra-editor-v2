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
import Input from './util/Input';

const useStyles = createUseStyles({
	container: {
		border: '1px solid',
		borderRadius: '6px',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	metricsSection: {
		margin: '0 0 1px 0',
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
			<section className={classes.metricsSection}>
				<iframe
					title={component}
					className={classes.metrics}
					src={`/grafana/d-solo/b164a7f0339f99f89cea5cb47e9be618/kubernetes-compute-resources-workload-5-second-update-interval?${metricsOptions}&panelId=1`}
				/>
			</section>
			<section className={classes.metricsSection}>
				<iframe
					title={component}
					className={classes.metrics}
					src={`grafana/d-solo/b164a7f0339f99f89cea5cb47e9be618/kubernetes-compute-resources-workload-5-second-update-interval?${metricsOptions}&panelId=3`}
				/>
			</section>
			<section className={classes.metricsSection}>
				<Input inputConfig={search} />
				<iframe
					title={component}
					className={classes.logs}
					src={`grafana/d-solo/logs/logs?${logsOptions}`}
				/>
			</section>
		</div>
	);
}

export default observer(Metrics);
