import { render, screen } from '@testing-library/react';
import Api from '../api/api';
import App from '../App';
import StoresProvider from '../StoresProvider';

jest.mock('../api/api');

test('renders box list', () => {
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
	const boxListTitle = screen.getByText(/loading/i);
	expect(boxListTitle).toBeInTheDocument();
});
