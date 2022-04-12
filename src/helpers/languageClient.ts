import normalizeUrl from 'normalize-url';
import {
	MonacoLanguageClient,
	MessageConnection,
	CloseAction,
	ErrorAction,
	createConnection,
	ConnectionCloseHandler,
	ConnectionErrorHandler,
} from 'monaco-languageclient';
import ReconnectingWebSocket from 'reconnecting-websocket';

export function createUrl(path: string): string {
	return normalizeUrl(path);
}

export function createWebSocket(url: string): WebSocket {
	const socketOptions = {
		maxReconnectionDelay: 10000,
		minReconnectionDelay: 1000,
		reconnectionDelayGrowFactor: 1.3,
		connectionTimeout: 10000,
		maxRetries: Infinity,
		debug: false,
	};
	// @ts-ignore
	return new ReconnectingWebSocket(url, [], socketOptions);
}

export function createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
	return new MonacoLanguageClient({
		name: 'Sample Language Client',
		clientOptions: {
			// use a language id as a document selector
			documentSelector: ['jsonLSP'],
			// disable the default error handler
			errorHandler: {
				error: () => ErrorAction.Continue,
				closed: () => CloseAction.DoNotRestart,
			},
		},
		// create a language client connection from the JSON RPC connection on demand
		connectionProvider: {
			get: (errorHandler: ConnectionErrorHandler, closeHandler: ConnectionCloseHandler) => {
				return Promise.resolve(createConnection(connection, errorHandler, closeHandler));
			},
		},
	});
}
