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

import { Tooltip } from '@material-ui/core';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
	overrides: {
		MuiTooltip: {
			tooltip: {
				fontSize: '16px',
				borderRadius: 6,
				border: '1px solid gray',
				color: 'black',
				backgroundColor: 'white',
			},
		},
	},
});

const CustomizedTooltip = (props: {
	title: string;
	disableCondition: boolean;
	children: React.ReactElement<any, any>;
}) => {
	return (
		<ThemeProvider theme={theme}>
			<Tooltip
				disableHoverListener={props.disableCondition}
				disableTouchListener={true}
				disableFocusListener={true}
				title={<span>{props.title}</span>}
			>
				{props.children}
			</Tooltip>
		</ThemeProvider>
	);
};

export default CustomizedTooltip;
