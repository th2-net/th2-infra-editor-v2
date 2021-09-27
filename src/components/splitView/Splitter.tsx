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
 *  limitations under the License.
 ***************************************************************************** */

import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
	container: {
		height: '100%',
		display: 'grid',
		alignContent: 'center',
		gridAutoFlow: 'column',
		justifyItems: 'center',
	},
	item: {
		display: 'flex',
		alignContent: 'center',
		gap: 8,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	triangleUp: {
		width: 0,
		height: 0,
		borderLeft: '5px solid transparent',
		borderRight: '5px solid transparent',
		borderBottom: ' 5px solid black',
	},
	triangleDown: {
		width: 0,
		height: 0,
		borderLeft: '5px solid transparent',
		borderRight: '5px solid transparent',
		borderTop: ' 5px solid black',
	},
	dots: {
		alignSelf: 'center',
		height: '150%',
	},
});

function Splitter() {
	const classes = useStyles();

	return (
		<div className={classes.container}>
			<div className={classes.item}>
				<div className={classes.triangleUp} />
				<div className={classes.dots}>. . .</div>
				<div className={classes.triangleDown} />
			</div>
			<div className={classes.item}>
				<div className={classes.triangleUp} />
				<div className={classes.dots}>. . .</div>
				<div className={classes.triangleDown} />
			</div>
		</div>
	);
}

export default Splitter;
