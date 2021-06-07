import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders box list', () => {
  render(<App />);
  const boxListTitle = screen.getByText(/Box list/i);
  expect(boxListTitle).toBeInTheDocument();
});
