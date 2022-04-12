import * as monaco from 'monaco-editor';

export const tokens: monaco.languages.IMonarchLanguage = {
	tokenizer: {
		root: [
			[/\"[A-Za-z0-9.\"\\\/+=:_-]+\"(?=:)/, 'left-text'],
			[/\d*[A-Za-z.\"\\\/+=_:-]*\d*[A-Za-z.\"\\\/+=:_-]+\d*/, 'right-text'],
			[/\d+/, 'digits'],
		],
	},
};

export const themeData: monaco.editor.IStandaloneThemeData = {
	base: 'vs',
	inherit: false,
	rules: [
		{ token: 'left-text', foreground: 'AC2042' },
		{ token: 'digits', foreground: '319263' },
		{ token: 'right-text', foreground: '4D67A8' },
	],
	colors: {
		'editor.foreground': '#000000',
	},
};
