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

import { createUseStyles } from 'react-jss';
import { Theme } from '../../styles/theme';
import { ExtendedConnectionOwner } from '../../models/Box';
import { useInput } from '../../hooks/useInput';
import Input from '../util/Input';
import { observer } from 'mobx-react-lite';
import { useBoxesStore } from '../../hooks/useBoxesStore';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const useStyles = createUseStyles((t: Theme) => ({
	container: {
		height: 'auto',
		width: '100%',
		position: 'relative',
		border: '1px solid rgba(0, 0, 0, 0.2)',
		borderRadius: '7px',
		padding: '5px',
		paddingTop: '12px',
	},
	label: {
		position: 'absolute',
		height: '24px',
		lineHeight: '18px',
		fontSize: '16px',
		background: '#fff',
		border: '1px solid rgba(0, 0, 0, 0.2)',
		borderRadius: '7px',
		padding: '3px 10px',
		userSelect: 'none',
		top: '-12px',
		left: '5px',
	},
	selected: {
		borderColor: '#5cad59',
	},
	inputGroup: {
		display: 'grid',
		gridTemplateColumns: 'repeat(2, 1fr)',
		gap: '4px',
		marginBottom: 5,
		height: 'auto',
		width: '100%',
	},
}));

interface ConnectionConfigProps {
	label: string;
	id: string;
	owner?: ExtendedConnectionOwner;
	setOwner: (owner: ExtendedConnectionOwner) => void;
	autocomplete?: string[];
	disabled: boolean;
	isBoxFieldDisabled: boolean;
	isSelected?: boolean;
}

function ConnectionConfig(props: ConnectionConfigProps) {
	const {
		label,
		id,
		owner,
		setOwner,
		autocomplete = [],
		disabled,
		isBoxFieldDisabled,
		isSelected = false,
	} = props;

	const classes = useStyles();

	const boxesStore = useBoxesStore();

	const boxValidate = useCallback(
		(name: string): boolean =>
			boxesStore.boxes.filter(box => name === box.name).length === 1,
		[boxesStore.boxes],
	);

	const boxInput = useInput({
		initialValue: owner?.box || '',
		validate: boxValidate,
		id: `${id}Box`,
		label: 'Box',
		autocomplete: {
			datalistKey: `${id}BoxDatalist`,
			variants: [...autocomplete],
		},
		disabled: isBoxFieldDisabled || disabled,
	});

	const box = useMemo(() => {
		if (!boxInput.isValid || !boxValidate(boxInput.value)) {
			return null;
		}

		return boxesStore.boxes.filter(box => box.name === boxInput.value)[0];
	}, [boxInput.isValid, boxInput.value, boxValidate, boxesStore.boxes]);

	const pins = useMemo(() => {
		if (!box) {
			return [];
		}

		return box.spec.pins ?? [];
	}, [box]);

	const pinValidate = useCallback(
		pin => pins.map(pin => pin.name).includes(pin),
		[pins],
	);

	const pinInput = useInput({
		initialValue: owner?.pin || '',
		validate: pinValidate,
		id: `${id}Pin`,
		label: 'Pin',
		autocomplete: {
			datalistKey: `${id}PinDatalist`,
			variants: [...pins.map(pin => pin.name)],
		},
		disabled: disabled || !box,
	});

	const strategyInput = useInput({
		initialValue: owner?.strategy || '',
		id: `${id}Strategy`,
		label: 'Strategy',
		disabled: disabled,
	});

	const isPinSupportedServiceClassOption = useCallback(() => {
		return (
			pinValidate(pinInput.value) &&
			pins.filter(item => item.name === pinInput.value)[0]['connection-type'] === 'mq'
		);
	}, [pinInput.value, pinValidate, pins]);

	const serviceClassInput = useInput({
		initialValue: owner?.['service-class'] || '',
		id: `${id}ServiceClass`,
		label: 'Service class',
		disabled: disabled || isPinSupportedServiceClassOption(),
	});

	const updateOwner = useDebouncedCallback((value: ExtendedConnectionOwner) => {
		setOwner(value);
	}, 600);

	useEffect(() => {
		if (
			!boxInput.isValid ||
			!pinInput.isValid ||
			!strategyInput.isValid ||
			!serviceClassInput.isValid ||
			!boxValidate(boxInput.value) ||
			!pinValidate(pinInput.value)
		) {
			return;
		}

		updateOwner({
			box: boxInput.value,
			pin: pinInput.value,
			strategy: strategyInput.value,
			'service-class': serviceClassInput.value,
			connectionType: pins.filter(item => item.name === pinInput.value)[0]['connection-type'],
		});
	}, [
		boxInput.isValid,
		boxInput.value,
		boxValidate,
		pinInput.isValid,
		pinInput.value,
		pinValidate,
		pins,
		serviceClassInput.isValid,
		serviceClassInput.value,
		strategyInput.isValid,
		strategyInput.value,
		updateOwner,
	]);

	const containerClassName = classNames(classes.container, {
		[classes.selected]: isSelected,
	});

	const labelClassName = classNames(classes.label, {
		[classes.selected]: isSelected,
	});

	return (
		<div className={containerClassName}>
			<div className={labelClassName}>{label}</div>
			<div className={classes.inputGroup}>
				<Input inputConfig={boxInput} />
				<Input inputConfig={pinInput} />
				<Input inputConfig={strategyInput} />
				<Input inputConfig={serviceClassInput} />
			</div>
		</div>
	);
}

export default observer(ConnectionConfig);
