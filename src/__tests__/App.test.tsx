import { render, screen } from '@testing-library/react';
import Api from '../api/api';
import App from '../App';
import StoresProvider from '../StoresProvider';

jest.mock('../api/api');

test('loads schemas on mount', () => {
	const fetchSchemasListMock = jest.fn().mockReturnValueOnce([]);
	(Api as any).mockImplementation(() => {
		return {
			fetchSchemasList: fetchSchemasListMock,
		};
	});
	render(
		<StoresProvider api={new Api()}>
			<App />
		</StoresProvider>,
	);
	const loadingSchemas = screen.getByText(/loading/i);
	expect(loadingSchemas).toBeInTheDocument();
});
