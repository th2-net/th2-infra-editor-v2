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

class URLParamsStore {
	readonly schema: string | null = null;

	readonly object: string | null = null;

	readonly editorMode: string | null = null;

	readonly embedded: boolean = false;

	constructor() {
		const searchParams = new URLSearchParams(window.location.search.slice(1));

		this.schema = searchParams.get('schema');
		this.object = searchParams.get('object');
		this.editorMode = searchParams.get('editorMode');
		this.embedded = searchParams.get('embedded') === 'true';

		window.history.replaceState({}, '', window.location.pathname);
	}
}

export default URLParamsStore;
