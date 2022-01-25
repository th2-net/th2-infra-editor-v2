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

import { createUseStyles } from 'react-jss';
import { Theme } from '../../styles/theme';
import Icon from '../Icon';
import { DictionaryEntity } from '../../models/Dictionary';

const useStyles = createUseStyles(
    (theme: Theme) => ({
        container: {
            width: '100%',
            backgroundColor: '#fff',
            minHeight: 70,
            borderRadius: 6,
            overflow: 'hidden',
            display: 'grid',
            gridTemplateRows: '25px 1fr',
            cursor: 'pointer',
        },
        header: {
            height: 25,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            backgroundColor: '#7a99b8',
            color: '#fff'
        },
        name: {
            margin: '0 0 0 5px',
            fontSize: 12,
        },
    }),
    { name: 'Dictionary' },
);

interface Props {
    dictionary: DictionaryEntity;
		onClick: () => void;
    color?: string;
}

function Dictionary(props: Props) {
const { dictionary, color, onClick } = props;
const classes = useStyles();

return (
    <div className={classes.container} onClick={onClick}>
        <div className={classes.header} style={{ backgroundColor: color }}>
            <Icon id='book'/>
            <h5 className={classes.name}>{dictionary.name}</h5>
        </div>
    </div>
);
}

export default Dictionary;
