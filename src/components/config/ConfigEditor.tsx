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

import Editor from '@monaco-editor/react';

interface Props {
	value: string;
	setValue: (v: string) => void;
}

const ConfigEditor = ({ value, setValue }: Props) => {
	return (
		<div className='textarea-wrapper'>
			<Editor
				height={300}
				width='auto'
				defaultLanguage={'json'}
				options={{
					fontSize: 12,
					codeLens: false,
					lineNumbers: 'on',
					minimap: {
						enabled: false,
					},
					padding: {
						bottom: 0,
						top: 0,
					},
					autoClosingBrackets: 'always',
					autoClosingQuotes: 'always',
					contextmenu: false,
				}}
				value={value}
				onChange={v => setValue(v || '')}
			/>
		</div>
	);
};

export default ConfigEditor;
