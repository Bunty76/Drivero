import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, AuthContext } from '../src/store/AuthContext';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TestComponent = () => {
  const { userToken, driverInfo, login, logout, isLoading } = React.useContext(AuthContext);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <>
      <Text testID="token">{userToken || 'no-token'}</Text>
      <Text testID="driver-name">{driverInfo ? driverInfo.name : 'no-driver'}</Text>
      <Text testID="login-btn" onPress={() => login('fake-token', { name: 'Fake Driver' })}>Login</Text>
      <Text testID="logout-btn" onPress={logout}>Logout</Text>
    </>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes and checks storage for token', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce('saved-token')
      .mockResolvedValueOnce(JSON.stringify({ name: 'Saved Driver' }));

    const { getByTestId, queryByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(queryByText('Loading...')).toBeTruthy();

    await waitFor(() => {
      expect(getByTestId('token').props.children).toBe('saved-token');
      expect(getByTestId('driver-name').props.children).toBe('Saved Driver');
    });
  });

  it('allows user to login', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('token').props.children).toBe('no-token');
    });

    act(() => {
      getByTestId('login-btn').props.onPress();
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('userToken', 'fake-token');
      expect(getByTestId('token').props.children).toBe('fake-token');
      expect(getByTestId('driver-name').props.children).toBe('Fake Driver');
    });
  });

  it('allows user to logout', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce('saved-token')
      .mockResolvedValueOnce(JSON.stringify({ name: 'Saved Driver' }));

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('token').props.children).toBe('saved-token');
    });

    act(() => {
      getByTestId('logout-btn').props.onPress();
    });

    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userToken');
      expect(getByTestId('token').props.children).toBe('no-token');
    });
  });
});
