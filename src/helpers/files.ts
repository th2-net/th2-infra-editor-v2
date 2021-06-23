/** *****************************************************************************
 * Copyright 2009-2020 Exactpro (Exactpro Systems Limited)
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

import { isArray, isPlainObject } from "lodash";

export function downloadFile(content: string, filename: string, extension: string) {
	const file = new Blob([content], { type: extension });

	if (window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveOrOpenBlob(file);
	} else {
		const a = document.createElement('a');
		const url = URL.createObjectURL(file);
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}
}

export function defineFileFormat(content: string): 'xml' | 'json' | 'yaml' {
	if (content.length === 0) return 'xml';
	if (/(<.[^(><.)]+>)/gm.test(content)) return 'xml';
	if (/^{.*}$/gm.test(content)) return 'json';
	return 'yaml';
}

export const isXMLValid = (xml: string) => {
	const parser = new DOMParser();
	const theDom = parser.parseFromString(xml, 'application/xml');
	if (theDom.getElementsByTagName('parsererror').length > 0) {
		return false;
	}
	return true;
};

export const isJSONValid = (json: string) => {
	if (json.length === 0) return true;
	try {
		const config = JSON.parse(json);
		return typeof config === 'object';
	} catch {
		return false;
	}
};

export const isValidJSONObject = (json: string) => {
	if (json.length === 0) return true;
	try {
		const parsedData = JSON.parse(json);
		return isPlainObject(parsedData);
	} catch {
		return false;
	}
};

export const isValidJSONArray = (json: string) => {
	if (json.length === 0) return true;
	try {
		const parsedData = JSON.parse(json);
		return isArray(parsedData);
	} catch {
		return false;
	}
};
