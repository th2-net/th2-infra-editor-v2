
import React from 'react';
import { createUseStyles } from 'react-jss';
import { Change } from 'diff';

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
        overflow: 'scroll',
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
        width: '100%',
        overflow: 'auto',
    },
    wrap: {
        whiteSpace: 'pre-wrap',
    }
});

const getChange = (dif: Change[]) => {
    const res: {prev: string, next: string}[] = []
    dif.forEach((change, index, self)=> {
        if (change.removed && index+1 < self.length  && self[index+1].added) {
            res.push({prev: change.value, next: self[index-1].value})
            return;
        }
        if (change.added && index-1 < self.length && !self[index-1].removed) {
            res.push({prev: '', next: change.value})
            return;
        }
        if (change.removed) {
            res.push({prev: change.value, next: ''})
            return;
        }
        res.push({prev: change.value, next: change.value});
    })
    return res;
}

const DifferenceWindow = (prop: { dif: {key:string, change:Change[]}[], temp?: {prev:string, next:string} }) => {
    const classesGeneral = useStylesGeneral();
    const classesAttr = useStylesAttr();
    return <div className={classesGeneral.Window}>
        <div className={classesGeneral.difContainer}>
            {prop.dif.map(val => <div className={classesAttr.specDif}>
                {val.key}
                <div className={classesAttr.difValueContainer}>
                    {val.change.map((change, index, self) => {
                        if (change.removed || change.added)
                            return <>
                                {change.removed && index + 1 < self.length && !self[index + 1].added && <div className={classesAttr.change}><pre className={classesAttr.wrap}>
                                    ---
                                </pre> </div>}
                                <div className={classesAttr.change}><pre className={classesAttr.wrap}>
                                    {change.removed ? 'Before: ' : 'Now: '}{change.value}
                                </pre></div>
                                {change.added && index - 1 < self.length && !self[index - 1].removed && <div className={classesAttr.change}><pre className={classesAttr.wrap}>
                                    +++
                                </pre> </div>}
                            </>
                        return <div className={classesAttr.val}><pre className={classesAttr.wrap}>
                            {change.value}
                        </pre></div>
                    })}
                </div>
            </div>)}
        </div>
    </div>
}

export default DifferenceWindow;