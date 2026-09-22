import { render, screen } from '@testing-library/react-native';

import { ApiError, NetworkError } from '../../api/client';
import { fetchHealth } from '../../api/health';
import { HomeScreen } from '../HomeScreen';

// Mock the module, not fetch: this test is about how the screen reacts to each
// outcome, and client.test.ts already covers turning responses into outcomes.
jest.mock('../../api/health');
const mockedFetchHealth = jest.mocked(fetchHealth);

describe('HomeScreen', () => {
  it('shows the API status when the health check succeeds', async () => {
    mockedFetchHealth.mockResolvedValue({ status: 'ok' });

    await render(<HomeScreen />);

    expect(await screen.findByText('API status: ok')).toBeTruthy();
  });

  it('offers a retry when the server cannot be reached', async () => {
    mockedFetchHealth.mockRejectedValue(new NetworkError('offline'));

    await render(<HomeScreen />);

    expect(await screen.findByText('Cannot reach the server')).toBeTruthy();
    expect(screen.getByText('Retry')).toBeTruthy();
  });

  it('does not offer a retry for a 4xx, which will never succeed', async () => {
    mockedFetchHealth.mockRejectedValue(new ApiError('Bad request', 400, null));

    await render(<HomeScreen />);

    expect(await screen.findByText('Server error (400)')).toBeTruthy();
    expect(screen.queryByText('Retry')).toBeNull();
  });
});
