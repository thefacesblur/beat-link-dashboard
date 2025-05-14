import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { SettingsProvider } from './SettingsContext';

// Mock useParamsData to avoid network or side effects
jest.mock('./useParamsData', () => () => ({ data: null, error: null }));

// Mock SettingsPanel to avoid portal issues
jest.mock('./SettingsPanel', () => () => <div data-testid="settings-panel" />);

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <SettingsProvider>
        <App />
      </SettingsProvider>
    );
    expect(screen.getByText(/Beat Link Dashboard/i)).toBeInTheDocument();
  });
}); 