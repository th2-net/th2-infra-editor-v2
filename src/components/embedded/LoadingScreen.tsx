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

import React from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
	container: {
		width: '100%',
		height: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	'@keyframes spin': {
		from: { transform: 'rotate(0deg)' },
		to: { transform: 'rotate(360deg)' },
	},
	spinner: {
		marginRight: 8,
		height: '16px',
		width: '16px',
		border: '3px solid #1111',
		borderTop: '3px solid #4D4D4D',
		borderRadius: '50%',
		animationName: '$spin',
		animationDuration: '1s',
		animationTimingFunction: 'linear',
		animationIterationCount: 'infinite',
	},
});

const LoadingScreen = () => {
	const classes = useStyles();

	return (
		<div className={classes.container}>
			<div className={classes.spinner} />
			<p>Loading</p>
		</div>
	);
};

export default LoadingScreen;
