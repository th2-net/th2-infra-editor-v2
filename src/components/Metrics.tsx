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

import { computed, reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDebouncedCallback } from 'use-debounce/lib';
import { useBoxesStore } from '../hooks/useBoxesStore';
import { useInput } from '../hooks/useInput';
import { useSchemaStore } from '../hooks/useSchemaStore';
import grafanaPaths from '../api/grafanaPaths.json';
import Input from './util/Input';

const useStyles = createUseStyles({
	container: {
		border: '1px solid',
		gridArea: 'metrics',
		borderRadius: 6,
		overflow: 'hidden',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	metricsSection: {
		height: '33%',
	},
	metrics: {
		height: '100%',
		width: '100%',
		border: 'none',
	},
	logs: {
		height: 'calc(100% - 40px)',
		width: '100%',
		border: 'none',
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

	const options = computed(() => schemaStore.selectedSchema && `var-namespace=th2-${schemaStore.selectedSchema}&theme=light`).get()

	const logsOptions = useMemo(() => {
		if (component === '') {
			return null;
		}

		return `orgId=1&refresh=10s&${options}&var-component=${component}&var-search=${searchDebouncedValue}&panelId=${grafanaPaths.logsPanelId}`;
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
		const boxSubscription = reaction(
			() => boxesStore.selectedBox,
			box => {
				setComponent(box?.name || '');
			},
		);

		return boxSubscription;
	}, [boxesStore.selectedBox]);

	if (!options || !logsOptions || !metricsOptions) return null;

	return (
		<div className={classes.container}>
			<section className={classes.metricsSection}>
				<iframe
					title={component}
					className={classes.metrics}
					src={`${grafanaPaths.cpuMemoryPanel}?${metricsOptions}&panelId=${grafanaPaths.cpuUsagePanelId}`}
				/>
			</section>
			<section className={classes.metricsSection}>
				<iframe
					title={component}
					className={classes.metrics}
					src={`${grafanaPaths.cpuMemoryPanel}?${metricsOptions}&panelId=${grafanaPaths.memoryUsagePanelId}`}
				/>
			</section>
			<section className={classes.metricsSection}>
				<Input inputConfig={search} />
				<iframe
					title={component}
					className={classes.logs}
					src={`${grafanaPaths.logsPanel}?${logsOptions}`}
				/>
			</section>
		</div>
	);
}

export default observer(Metrics);
