import { render, screen } from '@testing-library/react';
import App from './App';

test('renders UIU Helper Pro brand', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/UIU HELPER/i);
  expect(brandElements.length).toBeGreaterThan(0);
});
