
import React from 'react';
import { createUseStyles } from 'react-jss';
import { Change, diffChars } from 'diff';

const useStylesGeneral = createUseStyles({
    removed: {
        color: '#F5B83D',
        fontWeight: 900,
    },
    added: {
        color: '#0099E5',
        fontWeight: 900,
    },
    Window:{
        overflowY: 'scroll',
        maxHeight: 630,
        display:'flex',
        flexDirection: 'column',
        gap: 12,
    },
    button:{
        border: '4px solid #E5E5E5',
        borderRadius: 4,
        borderWidth: 1,
        background: '#F3F3F6',
        padding: '8px 12px',
        marginRight: 12,
        color: '#333333CC',
    },
    buttonFocus:{
        border: '4px solid #0099E5',
        borderRadius: 4,
        borderWidth: 1,
        background: '#5CBEEF',
        padding: '8px 12px',
        marginRight: 12,
        color: '#FFFFFF',
    },
    buttonFilter:{
        borderColor: 'transparent',
        background: '#ffffff',
        color: '#33333399',
        display: 'flex',
        justifyContent: 'space-between',
        width: 120,
        borderRadius: 4,
        lineHeight: '22px',
        boxShadow: '0px 1px 4px 0px rgba(0, 0, 0, 0.08)',
        '&:hover':{
            background: '#F3F3F6',
        }
    },
    buttonFilterActive:{
        background: '#ffffff',
        border: '1px solid #5CBEEF',
        color: '#33333399',
        display: 'flex',
        justifyContent: 'space-between',
        width: 120,
        borderRadius: 4,
        lineHeight: '22px',
        boxShadow: '0px 1px 4px 0px rgba(0, 0, 0, 0.08)',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    filterOn:{
        width: '100%',
        padding: 8,
        color: '#ffffff',
        background: '#5CBEEF',
        marginBottom: 2,
    },
    filterOff:{
        width: '100%',
        padding: 8,
        color: '#333333',
        background: '#ffffff',
        marginBottom: 2,
        '&:hover': {
            color: '#33333399',
            background: '#F3F3F6',
        }
    },
    filter: {
        borderRadius: 4,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        background: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'column',
        border: '1px solid #5CBEEF',
        borderTop: 0,
        position: 'relative',
    },
    majorContainer: {
        display: 'flex',
        justifyContent: 'left',
        gap: 12,
    },
    difContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 15,
    },
    specHeader:{
        display: 'flex',
        justifyContent: 'space-between',
        maxHeight: 36,
    },
});

const useStylesMajor = createUseStyles({
    difValueHeader: {
        color: '#333333',
        fontSize: '12px',
        lineHeight: '12px',
    },
    difSpec: {
        width: '24%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    difHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: 4,
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
        borderRadius: 4,
        color: '#33333399',
    },
    difValueContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    }, 
    difValue:{
        border: '1px solid #E5E5E5',
        borderRadius: 4,
        padding: 4,
        background: '#FFFFFF',
        fontSize: '14px',
        lineHeight: '24px',
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
    },
});

const useStylesAttr = createUseStyles({
    specContainer: {
        padding: '2px 5px',
    },
    difValueHeader: {
        color: '#333333',
        fontSize: '14px',
        lineHeight: '16px',
        fontWeight: 800,
    },
    attrbHeader: {
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
        display: 'flex',
		justifyContent: 'space-between',
        padding: 16,
		borderRadius: 8,
        fontSize: '16px',
        fontWeight: 500,
    },
    specDif: {
        padding: '5px 16px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 9,
    },
    specChange: {
        width: '49%',
        overflow: 'auto',
        padding: 8,
        backgroundColor: '#F3F3F6',
        borderRadius: 9,
        border: '4px solid transparent',
        fontSize: 14,
        lineHeight: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    difValue:{
        border: '1px solid #E5E5E5',
        borderRadius: 4,
        padding: 4,
        background: '#FFFFFF',
        fontSize: '14px',
        lineHeight: '24px',
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
    },
    difValueContainer: {
        width:'100%',
        display: 'flex',
        flexWrap: 'wrap',
    }, 
    change: {
        width: '49%',
    },
    val:{
        display:'flex',
        width: '100%',
    },
    wrap: {
        whiteSpace: 'pre-wrap',
    },
    high:{
        color:'red',
    },
    low:{
        color:'green',
    }
});

const ValueWrapper = (props: { valKey: string, changes: Change[][] }) => {
    const classesAttr = useStylesAttr();
    const {valKey, changes} = props;
    return <div className={classesAttr.specDif}>
        <div>
            {valKey}
        </div>
    {
        changes.map(change => {
            const clear = change.filter(ch => ch.removed || ch.added).length === 0;
            const before = !clear && change.filter(val=>!val.added);
            const after = !clear && change.filter(val=>!val.removed);
            return clear
                ? <div className={classesAttr.val}><span><pre>{change[0].value}</pre></span></div>
                : <div className={classesAttr.val}>
                    <div className={classesAttr.change}>
                        <i/>
                        {before && before.map(ch => <span className={ch.removed ? classesAttr.high : undefined}>
                            {ch.value}
                        </span>)}
                    </div>
                    <div className={classesAttr.change}>
                        <i/>
                        {after && after.map(ch => <span className={ch.added ? classesAttr.low : undefined}>
                            {ch.value}
                        </span>)}
                    </div>
                </div>
        })
    }
</div>;
}

const DifferenceWindow = (prop: { dif: {key:string, change:Change[]}[], temp?: {prev:string, next:string} }) => {
    const classesGeneral = useStylesGeneral();
    const classesAttr = useStylesAttr();
    const bef = prop.dif.map(val=>{
        return {
            key: val.key,
            change:val.change.map((val, ind, self) => {
                if (val.removed) {
                    if (ind + 1 < self.length && self[ind+1].added) return diffChars(val.value, self[ind+1].value);
                    return diffChars(val.value, '');
                }
                if (val.added) {
                    if (ind - 1 < self.length && self[ind-1].removed) return [];
                   return diffChars('', val.value);
                }
                return diffChars(val.value, val.value);
            }).filter(val=>val.length>0),
        }});
    console.log(bef, prop.dif);
    return <div className={classesGeneral.Window}>
        <div className={classesGeneral.difContainer}>
            {bef.map(val => <ValueWrapper valKey={val.key} changes={val.change}/>)}
        </div>
    </div>
}

export default DifferenceWindow;