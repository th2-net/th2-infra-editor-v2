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
import { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useBoxesStore } from '../hooks/useBoxesStore';
import { useSchemaStore } from '../hooks/useSchemaStore';
import { BoxEntity } from "../models/Box";

const useStyles = createUseStyles({
	container: {
		border: '1px solid',
		gridArea: 'metrics',
		borderRadius: 6,
		overflow: 'hidden'
	},
	metriks: {
		height: '100%',
		width: '100%',
		border: 'none',
	}
});

function Metrics() {
	const classes = useStyles();
	const schemaStore = useSchemaStore();
	const boxesStore = useBoxesStore();

	const [componet, setComponet] = useState<string>('');

	const source = useMemo(() => {
		const namespace = schemaStore.selectedSchema;

		return `http://th2-qa:30000/grafana/d-solo/logs/logs?orgId=1&refresh=10s&var-namespace=th2-${namespace}&var-component=${componet}&theme=light&panelId=8`;
	}, [schemaStore.selectedSchema, componet]);


	useEffect(() => {
		const boxSubscription = reaction(
			() => boxesStore.selectedBox,
			box => {
				setComponet(box?.name || '')
			},
		);

		return boxSubscription;
	}, [boxesStore.selectedBox]);

	return boxesStore.selectedBox && (
		<div className={classes.container}>
			<iframe className={classes.metriks} src={source}></iframe>
		</div>
	);
}

export default Metrics;

