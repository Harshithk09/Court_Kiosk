import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  // The app should render without throwing an error
});

test('has basic app structure', () => {
  render(<App />);
  // Check that the app container exists
  const appElement = document.querySelector('.App');
  expect(appElement).toBeInTheDocument();
}); 