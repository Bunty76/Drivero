import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../src/screens/LoginScreen';
import { AuthContext } from '../src/store/AuthContext';
import api from '../src/api/axios';
import { Alert } from 'react-native';

jest.mock('../src/api/axios');

describe('LoginScreen', () => {
  const mockLogin = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
  });

  const setup = () => {
    return render(
      <AuthContext.Provider value={{
        userToken: null,
        driverInfo: null,
        login: mockLogin,
        logout: jest.fn(),
        isLoading: false
      }}>
        <LoginScreen />
      </AuthContext.Provider>
    );
  };

  it('renders login form correctly', () => {
    const { getByPlaceholderText, getByText } = setup();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login to start driving')).toBeTruthy();
  });

  it('shows error alert if fields are empty', () => {
    const { getByText } = setup();
    fireEvent.press(getByText('Login'));
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter both email and password');
  });

  it('calls api login endpoint and context login on success', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { token: 'real-jwt', user: { id: 'd1', name: 'Real Driver' } }
    });

    const { getByPlaceholderText, getByText } = setup();
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'driver@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'driver@test.com',
        password: 'password123',
        role: 'driver'
      });
      expect(mockLogin).toHaveBeenCalledWith('real-jwt', { id: 'd1', name: 'Real Driver' });
    });
  });

  it('shows mock login fallback if api fails', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    const { getByPlaceholderText, getByText } = setup();
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'driver@test.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Login Failed',
        'Could not connect to backend. Do you want to use a mock login for testing?',
        expect.any(Array)
      );
    });
  });
});
