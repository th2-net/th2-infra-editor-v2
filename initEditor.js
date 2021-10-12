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

const fs = require('fs-extra');

const dir = './public/vs';

if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
} else {
	fs.emptyDirSync(dir);
}

Promise.all([
	fs.copy('./node_modules/monaco-editor/min/vs/base', './public/vs/base'),
	fs.copy('./node_modules/monaco-editor/min/vs/editor/', './public/vs/editor', {
		filter: (src) => {
			const files = ['editor.main.css', 'editor.main.js', 'editor.main.nls.js'];
			return !/\.(js|css)?$/.test(src) || files.some(file => src.includes(file));
		},
	}),
	fs.copy('./node_modules/monaco-editor/min/vs/language/json', './public/vs/language/json'),
	fs.copy('./node_modules/monaco-editor/min/vs/basic-languages/xml', './public/vs/basic-languages/xml'),
	fs.copy('./node_modules/monaco-editor/min/vs/loader.js', './public/vs/loader.js'),
]).catch(() => {
	throw new Error('Failed to copy editor files');
});
