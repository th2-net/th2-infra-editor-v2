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

import { reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useBoxesStore } from '../hooks/useBoxesStore';
import { useInput } from '../hooks/useInput';
import { useSchemaStore } from '../hooks/useSchemaStore';
import Input from './util/Input';

const useStyles = createUseStyles({
	container: {
		border: '1px solid',
		gridArea: 'metrics',
		borderRadius: 6,
		overflow: 'hidden',
	},
	metrics: {
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

	const source = useMemo(() => {
		const namespace = schemaStore.selectedSchema;

		if (component === '') {
			return null;
		}

		return `grafana/d-solo/logs/logs?orgId=1&refresh=10s&var-namespace=th2-${namespace}&var-component=${component}&var-search=${search.value}&theme=light&panelId=8`;
	}, [schemaStore.selectedSchema, component, search.value]);

	useEffect(() => {
		const boxSubscription = reaction(
			() => boxesStore.selectedBox,
			box => {
				setComponent(box?.name || '');
			},
		);

		return boxSubscription;
	}, [boxesStore.selectedBox]);


	if (!source) return null;

	return (
		<div className={classes.container}>
			<Input inputConfig={search} />
			<iframe title={component} className={classes.metrics} src={source}></iframe>
		</div>
	);
}

export default observer(Metrics);
