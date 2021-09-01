import { createUseStyles } from 'react-jss';
import { Theme } from '../../styles/theme';
import { ExtendedConnectionOwner } from '../../models/Box';
import { useInput } from '../../hooks/useInput';
import Input from '../util/Input';
import { observer } from 'mobx-react-lite';
import { useBoxesStore } from '../../hooks/useBoxesStore';
import { computed } from 'mobx';
import classNames from 'classnames';
import { useCallback, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const useStyles = createUseStyles((t: Theme) => ({
	container: {
		boxSizing: 'border-box',
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
	disabled?: 'box' | 'all' | 'none';
	isSelected?: boolean;
}

function ConnectionConfig(props: ConnectionConfigProps) {
	const { label, id, owner, setOwner, autocomplete = [], disabled = 'none', isSelected = false } = props;

	const classes = useStyles();

	const boxesStore = useBoxesStore();


	const boxValidate = useCallback((name: string): boolean => name.length > 0 && boxesStore.boxes.filter(box => name === box.name).length === 1, [boxesStore.boxes]);

	const boxInput = useInput({
		initialValue: owner?.box || '',
		validate: boxValidate,
		id: `${id}Box`,
		label: 'Box',
		autocomplete: {
			datalistKey: `${id}BoxDatalist`, variants: [...autocomplete],
		},
		disabled: disabled === 'box' || disabled === 'all',
	});

	const box = computed(() => {
		if (!boxInput.isValid || !boxValidate(boxInput.value)) {
			return null;
		}

		return boxesStore.boxes.filter(box => box.name === boxInput.value)[0];
	}).get();

	const pins = computed(() => {
		if (!box) {
			return [];
		}

		return box.spec.pins ?? [];
	}).get();

	const pinValidate = useCallback(pin => pin.length > 0 && pins.map(pin => pin.name).includes(pin), [pins]);

	const pin = useInput({
		initialValue: owner?.pin || '',
		validate: pinValidate,
		id: `${id}Pin`,
		label: 'Pin',
		autocomplete: {
			datalistKey: `${id}PinDatalist`, variants: [...pins.map(pin => pin.name)],
		},
		disabled: disabled === 'all' || !box,
	});

	const strategy = useInput({
		initialValue: owner?.strategy || '',
		id: `${id}Strategy`,
		label: 'Strategy',
		disabled: disabled === 'all',
	});

	const serviceClass = useInput({
		initialValue: owner?.['service-class'] || '',
		id: `${id}ServiceClass`,
		label: 'Service class',
		disabled: disabled === 'all' || (pinValidate(pin.value) && pins.filter(item => item.name === pin.value)[0]['connection-type'] === 'mq'),
	});

	const updateOwner = useDebouncedCallback((value: ExtendedConnectionOwner) => {
		setOwner(value);
	}, 600);

	useEffect(() => {
		if (!boxInput.isValid || !pin.isValid || !strategy.isValid || !serviceClass.isValid || !boxValidate(boxInput.value) || !pinValidate(pin.value)) {
			return;
		}

		updateOwner({
			box: boxInput.value,
			pin: pin.value,
			strategy: strategy.value,
			'service-class': serviceClass.value,
			connectionType: pins.filter(item => item.name === pin.value)[0]['connection-type'],
		});

	}, [boxInput.isValid, boxInput.value, boxValidate, pin.isValid, pin.value, pinValidate, pins, serviceClass.isValid, serviceClass.value, strategy.isValid, strategy.value, updateOwner]);

	return (
		<div className={classNames(classes.container, {
			[classes.selected]: isSelected,
		})}>
			{isSelected}
			<div className={classNames(classes.label, {
				[classes.selected]: isSelected,
			})}>
				{label}
			</div>
			<div className={classes.inputGroup}>
				<Input inputConfig={boxInput} />
				<Input inputConfig={pin} />
				<Input inputConfig={strategy} />
				<Input inputConfig={serviceClass} />
			</div>
		</div>
	);
}

export default observer(ConnectionConfig);