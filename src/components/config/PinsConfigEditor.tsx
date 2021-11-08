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

import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import { observer } from 'mobx-react-lite';
import * as monacoEditor from 'monaco-editor';
import { IPosition, IRange } from 'monaco-editor';
import React, { useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { getCountPinsConnections } from '../../helpers/pinConnections';
import { useBoxesStore } from '../../hooks/useBoxesStore';
import { useBoxUpdater } from '../../hooks/useBoxUpdater';
import { theme } from '../../styles/theme';
import { pinSchema } from '../../models/PinSchema';

const useStyle = createUseStyles({
	grayText: {
		color: `${theme.colorPrimary} !important`,
	},
});

interface Props {
	value: string;
	setValue: (v: string) => void;
}

type PinsPositions = {
	connections: number;
	position: IPosition;
};

const PinsConfigEditor = ({ value }: Props) => {
	const classes = useStyle();
	const editorRef = React.useRef<monacoEditor.editor.IStandaloneCodeEditor>();
	const monacoRef = React.useRef<Monaco>();
	const boxesStore = useBoxesStore();
	const boxesUpdater = useBoxUpdater();
	const [lensesDisposer, setLensesDisposer] = React.useState<monacoEditor.IDisposable>();

	const setLens = () => {
		const lenses: monacoEditor.languages.CodeLens[] = [];
		const pinsConnections = getCountPinsConnections(boxesStore, boxesUpdater);
		const pinsPositions: PinsPositions[] = [];
		if (pinsConnections) {
			const model = editorRef.current?.getModel();
			if (model) {
				pinsConnections.forEach((connection, index) => {
					const matches = model.findMatches(
						`"name": "${connection.name}"`,
						false,
						false,
						false,
						null,
						false,
					);
					matches.forEach(match => {
						const range = match.range;
						pinsPositions.push({
							connections: connection.numOfConnections,
							position: {
								lineNumber: range.startLineNumber,
								column: range.startColumn,
							},
						});

						lenses.push({
							range: range.setStartPosition(range.getStartPosition().lineNumber - 1, 1),
							command: { id: '', title: `connections: ${connection.numOfConnections}` },
						});
					});
				});
				const ranges = rangesOfUnusedPin(pinsPositions, model);
				selectZeroConnectionsPins(ranges);
			}
		}
		return lenses;
	};

	const selectZeroConnectionsPins = (ranges: IRange[]) => {
		ranges.forEach(r => {
			editorRef.current?.deltaDecorations(
				[],
				[
					{
						range: r,
						options: {
							inlineClassName: classes.grayText,
						},
					},
				],
			);
		});
	};

	const rangesOfUnusedPin = (
		pinsPositions: PinsPositions[],
		model: monacoEditor.editor.ITextModel,
	) => {
		const ranges: IRange[] = [];
		pinsPositions.forEach((position, index) => {
			if (position.connections === 0) {
				ranges.push({
					startLineNumber: pinsPositions[index].position.lineNumber - 2,
					startColumn: pinsPositions[index].position.column,
					endLineNumber:
						pinsPositions.length === 1 || index === pinsPositions.length - 1
							? model.getFullModelRange().endLineNumber - 1
							: pinsPositions[index + 1].position.lineNumber - 2,
					endColumn:
						pinsPositions.length === 1 || index === pinsPositions.length - 1
							? model.getFullModelRange().endColumn + 1
							: pinsPositions[index + 1].position.column,
				});
			}
		});

		return ranges;
	};

	useEffect(() => {
		lensesDisposer?.dispose();
		lensRegistrator();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [boxesStore.selectedBox]);

	const provideCodeLenses = () => {
		return { lenses: setLens(), dispose: () => null };
	};

	const lensRegistrator = () => {
		setLensesDisposer(
			monacoRef.current?.languages.registerCodeLensProvider('json', { provideCodeLenses }),
		);
	};

	const handleEditorDidMount: OnMount = (editor, monaco) => {
		editorRef.current = editor;
		monacoRef.current = monaco;
		const blob = new Blob([JSON.stringify(pinSchema)], { type: 'application/json' });
		const blobUri = URL.createObjectURL(blob).substring(5);
		monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
			schemaValidation: 'error',
			validate: true,
			schemas: [
				{
					uri: blobUri,
					fileMatch: ['a://b/pinschema.json'],
					schema: pinSchema,
				},
			],
		});
		monaco.editor.onDidChangeMarkers(() => {
			validate(monaco.editor.getModelMarkers({}));
		});
		lensRegistrator();
	};

	const validate = (markers: monacoEditor.editor.IMarker[]) => {
		boxesStore.isSelectedBoxValid = !(markers.length > 0);
		console.log(
			`${boxesStore.isSelectedBoxValid}, ${monacoRef.current?.languages.json.jsonDefaults.diagnosticsOptions.schemas}`,
		);
	};

	return (
		<div className='textarea-wrapper'>
			<Editor
				height={300}
				width='auto'
				path='a://b/pinschema.json'
				defaultLanguage={'json'}
				options={{
					fontSize: 12,
					codeLens: true,
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
				onMount={handleEditorDidMount}
			/>
		</div>
	);
};

export default observer(PinsConfigEditor);
