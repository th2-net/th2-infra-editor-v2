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
import Editor, { EditorProps } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import ResizeDetector from './ResizeDetector';
import Size from '../../util/Size';

type EditorConfig = Omit<EditorProps, 'width' | 'height' | 'options'> & {
	options: Omit<editor.IStandaloneEditorConstructionOptions, 'automaticLayout'>;
};

/**
 * Responsive Monaco Editor that automatically fills all available space
 * @example
 * const rootStyle = {
 *   width: '100%',
 *   height: '100vh',
 *   display: 'grid',
 *   gridTemplateColumns: '300px 1fr 300px',
 * }
 *
 * <div style={rootStyle}>
 *   <div>Some content</div>
 *   <AutoResizableEditor />
 *   <div>Some content</div>
 * </div>
 */
const AutoResizableEditor = (editorConfig: EditorConfig) => {
	const [editorSize, setEditorSize] = React.useState({ width: 0, height: 0 });

	const onResize = React.useCallback((newSize: Size) => {
		setEditorSize(newSize);
	}, []);

	return (
		<ResizeDetector onSizeChange={onResize}>
			<Editor width={editorSize.width} height={editorSize.height} {...editorConfig} />
		</ResizeDetector>
	);
};

export default AutoResizableEditor;
