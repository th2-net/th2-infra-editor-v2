
import React from 'react';
import { createUseStyles } from 'react-jss';
import { Change, diffChars } from 'diff';
import Input from './Input';
import { useInput } from '../../hooks/useInput';

const useStyles = createUseStyles({
	window: {
		width: '100%',
		overflow: 'auto',
		maxHeight: 700,
		display: 'flex',
		flexDirection: 'column',
		gap: 5,
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
		whiteSpace: 'pre-wrap'
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
		cursor: 'pointer',
		display: 'flex',
		gap: 4,
		'& div': {
			transform: 'rotate(180deg)',
		}
	}
});

const UnchangedValue = (props: { value: Change }) => {
	const classes = useStyles();
	const [isOpen, setIsOpen] = React.useState(false);
	const lineAmount = props.value.value.split('\n').length - 1;
	return isOpen
		? <>
			<div className={classes.boundary} onClick={() => setIsOpen(false)}>
				<div>V</div> hide {lineAmount} lines <div>V</div>
			</div>
			<div className={classes.line}>
				<div className={classes.cell}><pre className={classes.wrap}>
					{props.value.value}
				</pre></div>
				<div className={classes.cell}><pre className={classes.wrap}>
					{props.value.value}
				</pre></div>
			</div>
			<div className={classes.boundary} onClick={() => setIsOpen(false)}>
				V hide {lineAmount} lines V
			</div>
		</>
		: <div onClick={() => setIsOpen(true)} className={classes.separator}>
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
	const [isOpen, setIsOpen] = React.useState(true);
	return <div className={classes.valueWrapper}>
		<div className={classes.header} onClick={() => setIsOpen(!isOpen)}>
			{valKey}
			<span>{isOpen ? '-' : '+'}</span>
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

const DifferenceWindow = (prop: { dif: { key: string, change: Change[] }[], }) => {
	const classes = useStyles();
	const inputConfig = useInput({
		id:`Changes`,
		initialValue: '',
		autocomplete: {
			datalistKey: `ChangesDatalist`,
			variants: [...prop.dif.map(val=>val.key)],
		}
	})
	const pairs = prop.dif.filter(val=>val.key.includes(inputConfig.value)).map(val => {
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
	});
	React.useEffect(()=>console.log(inputConfig), [inputConfig])
	return <div className={classes.window}>
		<Input inputConfig={inputConfig}/>
		{pairs.map(val => <ValueWrapper valKey={val.key} changes={val.change} />)}
	</div>
}

export default DifferenceWindow;