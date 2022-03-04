/** *****************************************************************************
 * Copyright 2020-2020 Exactpro (Exactpro Systems Limited)
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

import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import ModalWindow from './ModalWindow';
import { modalWindow } from '../../styles/mixins';
import DifferenceWindow from './DifferenceWindow';
import { Change, diffJson, diffLines } from 'diff';
import { useBoxUpdater } from '../../hooks/useBoxUpdater';
import { useSchemaStore } from '../../hooks/useSchemaStore';
import { toJS } from 'mobx';

const useStyles = createUseStyles({
	modalWindow: {
		...modalWindow(),
		display: 'flex',
		flexDirection: 'column',
		gap: 20,
		width: '90%',
	},
	messageContainer: {
		fontSize: 20,
		overflowY: 'auto',
		height: 30,
	},
	buttonArea: {
		height: 50,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		'& button': {
			margin: 5,
			height: 40,
			width: 50,
		},
	},
});




const ModalConfirmation = (props: {
	setOpen: Dispatch<SetStateAction<boolean>>;
	action: () => void;
	message: string;
}) => {
	const classes = useStyles();
	const boxUpdater = useBoxUpdater();
	const { selectedSchemaName, boxesStore, fetchSchema } = useSchemaStore();
	const [changes, setChanges] = React.useState<{key:string, change:Change[]}[]>([]);
	const [error, setError] = React.useState<undefined | string>(undefined);

	const fetchDifference = () => {
		const schema = fetchSchema(selectedSchemaName);
		const changes = boxUpdater.changes.slice();
		if (schema)
			schema.then(val => {
				const res = val.resources.filter(resource => changes.filter(change => change.prevName === resource.name).length > 0).slice();
				setChanges(res.map(prevVal => {
					const boxCopy = toJS(boxesStore.boxes.find(box => changes.find(b=>b.prevName===prevVal.name)?.nextName === box.name));
					if (boxCopy) {
						const dif = diffJson(boxCopy, prevVal);
						const before = dif.filter(change=>!change.added).map(change=>change.value).join('');
						const after = dif.filter(change=>!change.removed).map(change=>change.value).join('');
						return {key: prevVal.name, change:diffLines(after, before)};
					}
					return {key: prevVal.name, change:[]}
				}));
			}).catch(err=>{
				setError(String(err));
			});
	}
	useEffect(()=>fetchDifference());
	
	return (
		<ModalWindow setOpen={props.setOpen}>
			<div className={classes.modalWindow}>
				<div className={classes.messageContainer}>{props.message}</div>
				{error
					? <div>{error}</div>
					: <DifferenceWindow changes={changes} />}
				Are you sure you want  to submit on those changes ?
				<div className={classes.buttonArea}>
					<button
						onClick={() => {
							props.action();
							props.setOpen(false);
						}}>
						Yes
					</button>
					<button
						onClick={() => {
							props.setOpen(false);
						}}>
						No
					</button>
				</div>
			</div>
		</ModalWindow>
	);
};

export default ModalConfirmation;
