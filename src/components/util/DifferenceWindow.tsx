
import React from 'react';
import { createUseStyles } from 'react-jss';
import { Change, diffChars } from 'diff';
import Input from './Input';
import { useInput } from '../../hooks/useInput';
import arrowUp from '../../assets/icons/arrow-up.svg'

const useStyles = createUseStyles({
	window: {
		width: '100%',
		overflow: 'auto',
		height: 700,
		display: 'flex',
		flexDirection: 'column',
		gap: 16,
		padding: 5,
	},
	valueWrapper: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.16)',
		borderRadius: 4,
		gap: 5
	},
	header: {
		cursor: 'pointer',
		width: '100%',
		display: 'flex',
		justifyContent: 'space-between',
		padding: 16,
	},
	iconOpen: {
		transform: 'rotate(0.5turn)',
	},
	line: {
		padding: '0px 16px',
		width: '100%',
		display: 'flex',
		gap: '2%',
	},
	separator: {
		width: '95%',
		borderBottom: '1px solid black',
		lineHeight: 0.1,
		textAlign: 'center',
		cursor: 'pointer',
		margin: '16px 0px',
	},
	separatorInline: {
		width: '40%',
		borderBottom: '1px solid black',
		lineHeight: 0.1,
		textAlign: 'center',
		cursor: 'pointer',
		margin: '16px 0px',
	},
	separatorText: {
		padding: '0 16px',
		backgroundColor: 'white',
	},
	cell: {
		width: '49%',
		padding: 8,
		backgroundColor: '#F3F3F6',
		borderRadius: 4,
	},
	wrap: {
		whiteSpace: 'pre-wrap',
		wordWrap: 'break-word',
	},
	removed: {
		color: '#F53D3D',
		fontWeight: 900,
	},
	added: {
		color: '#5CBEEF',
		fontWeight: 900,
	},
	boundary: {
		width:'95%',
		cursor: 'pointer',
		display: 'flex',
		justifyContent: 'space-between',
		gap: 4,
	},
	arrowUp: {
		width: 25,
		height: 25,
		backgroundImage: `url(${arrowUp})`,
		backgroundSize: '100%',
		display: 'inline-block',
		verticalAlign: 'middle',
	},
	arrowDown: {
		width: 25,
		height: 25,
		backgroundImage: `url(${arrowUp})`,
		backgroundSize: '100%',
		transform: 'rotate(180deg)',
		display: 'inline',
	},
	changesCount: {
		color: '#fff',
		backgroundColor: '#5CBEEF',
		borderRadius: 12,
		padding: 6,
		height: 'fit-content',
	},
	name: {
		height: '100%',
		background: 'transparent',
		lineHeight: '26px',
		width: 'fit-content',
	}
});

const UnchangedValue = (props: { value: Change }) => {
	const classes = useStyles();
	const [isOpen, setIsOpen] = React.useState(false);
	const lineAmount = props.value.value.split('\n').length - 1;
	return isOpen
		? <>
			<div className={classes.boundary} onClick={() => setIsOpen(false)} title='hide unchanged lines'>
				<i className={classes.arrowDown} />
				<div className={classes.separator} />
				<i className={classes.arrowDown} />
			</div>
			<div className={classes.line}>
				<div className={classes.cell}><pre className={classes.wrap}>
					{props.value.value}
				</pre></div>
				<div className={classes.cell}><pre className={classes.wrap}>
					{props.value.value}
				</pre></div>
			</div>
			<div className={classes.boundary} onClick={() => setIsOpen(false)} title='hide unchanged lines'>
				<i className={classes.arrowUp} />
				<div className={classes.separator} />
				<i className={classes.arrowUp} />
			</div>
		</>
		: <div onClick={() => setIsOpen(true)} className={classes.separator} title='reveal unchanged lines'>
			<span className={classes.separatorText}>
				hidden {lineAmount} lines
			</span>
		</div>
}

const ChangedValue = (props: { before: Change[], after: Change[] }) => {
	const classes = useStyles();
	const { before, after } = props;
	return (
		<div className={classes.line}>
			<div className={classes.cell}><pre className={classes.wrap}>
				<span>-</span>
				{before.map(ch => <span className={ch.removed ? classes.removed : undefined}>
					{ch.value}
				</span>)}
			</pre></div>
			<div className={classes.cell}><pre className={classes.wrap}>
				<span>+</span>
				{after.map(ch => <span className={ch.added ? classes.added : undefined}>
					{ch.value}
				</span>)}
			</pre></div>
		</div>
	)
}

const ValueWrapper = (props: { valKey: string, changes: Change[][] }) => {
	const classes = useStyles();
	const { valKey, changes } = props;
	const [isOpen, setIsOpen] = React.useState(false);
	return <div className={classes.valueWrapper}>
		<div className={classes.header} onClick={() => setIsOpen(!isOpen)} title={isOpen ? 'Close box' : 'Open box'}>
			<div style={{ gap: '16px', display: 'flex', alignItems: 'center' }}>
			<div className={classes.name}>{valKey}</div>
				
				<div className={classes.changesCount}>
					{changes.filter(val => val.filter(ch => ch.removed || ch.added).length !== 0).length}
				</div>
			</div>
					
			<i className={isOpen ? classes.arrowUp:classes.arrowDown}/>
		</div>
		{
			isOpen && changes.map(change => {
				const clear = change.filter(ch => ch.removed || ch.added).length === 0;
				const before = !clear && change.filter(val => !val.added);
				const after = !clear && change.filter(val => !val.removed);
				return clear
					? <UnchangedValue value={change[0]} />
					: before && after && <ChangedValue before={before} after={after} />
			})
		}
	</div>;
}

const DifferenceWindow = (prop: { changes: { key: string, change: Change[] }[], }) => {
	const classes = useStyles();
	const { changes } = prop;
	const inputConfig = useInput({
		id:`Changes`,
		initialValue: '',
		autocomplete: {
			datalistKey: `ChangesDatalist`,
			variants: [...changes.map(val=>val.key)],
		},
		required: false,
		label: 'Search',
		placeholder: 'Search for changed box',
	})

	const [pairs, setPairs] = React.useState<{ key: string, change: Change[][] }[]>([]);

	React.useEffect(() => {
		setPairs(changes.filter(val => val.key.includes(inputConfig.value)).map(val => {
			return {
				key: val.key,
				change: val.change.map((val, ind, self) => {
					if (val.removed) {
						if (ind + 1 < self.length && self[ind + 1].added) return diffChars(val.value, self[ind + 1].value);
						return diffChars(val.value, '');
					}
					if (val.added) {
						if (ind - 1 < self.length && self[ind - 1].removed) return [];
						return diffChars('', val.value);
					}
					return diffChars(val.value, val.value);
				}).filter(val => val.length > 0),
			}
		}).sort((a, b) => a.key.localeCompare(b.key)));

	}, [inputConfig.value, changes])

	return <div className={classes.window}>
		<Input inputConfig={inputConfig} />
		{
			pairs.length > 0
				? pairs.map(val => <ValueWrapper key={val.key} valKey={val.key} changes={val.change} />)
				: 'Loading...'
		}
	</div>
}

export default DifferenceWindow;