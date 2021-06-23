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
import { useInput } from '../../hooks/useInput';
import { isXMLValid } from '../../helpers/files';
import ConfigEditor from './ConfigEditor';
import { DictionaryEntity } from '../../models/Dictionary';

interface DictionaryEditorProps {
	dictionary: DictionaryEntity | null;
}

const DictionaryEditor = ({ dictionary }: DictionaryEditorProps) => {

	const [dictionaryData, setDictionaryData] = React.useState<{
		value: string;
		isValid: boolean;
	}>({
		value: dictionary?.spec.data ?? '',
		isValid: true,
	});

	const dictionaryInputConfig = useInput({
		initialValue: dictionary?.spec.data,
		id: 'dictionary-editor',
		validate: value => {
			if (value.length === 0) return true;
			return isXMLValid(value);
		},
		label: dictionary?.name,
	});

	React.useEffect(() => {
		setDictionaryData({
			value: dictionaryInputConfig.value,
			isValid: isXMLValid(dictionaryInputConfig.value),
		});
	}, [dictionaryInputConfig.value, setDictionaryData]);

	return <ConfigEditor configInput={dictionaryInputConfig} />;
};

export default DictionaryEditor;
 