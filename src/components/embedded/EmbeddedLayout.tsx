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
import { useURLParamsStore } from '../../hooks/useURLParamsStore';
import EmbeddedDictionaryEditor from './EmbeddedDictionaryEditor';
import { useSchemaStore } from '../../hooks/useSchemaStore';
import LoadingScreen from './LoadingScreen';
import { observer } from 'mobx-react-lite';

interface EmbeddedViews {
	[editorMode: string]: React.ReactNode;
}

const embeddedViews: EmbeddedViews = {
	dictionaryEditor: <EmbeddedDictionaryEditor />,
};

const EmbeddedLayout = () => {
	const { editorMode } = useURLParamsStore();
	const { isLoading } = useSchemaStore();

	if (!editorMode || !embeddedViews[editorMode]) {
		return <div>Please provide a valid editorMode</div>;
	}

	if (isLoading) {
		return <LoadingScreen />;
	}

	return <>{embeddedViews[editorMode]}</>;
};

export default observer(EmbeddedLayout);
