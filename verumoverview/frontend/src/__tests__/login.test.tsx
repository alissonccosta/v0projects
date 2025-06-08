import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthContext } from '../contexts/AuthContext';
jest.mock('../services/logger', () => ({ logAction: jest.fn() }));
jest.mock('../services/api', () => ({ default: { post: jest.fn(), defaults: { headers: { common: {} } } } }));

const navigateMock = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

describe('Login', () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  test('redireciona apos sucesso', async () => {
    const loginMock = jest.fn().mockResolvedValue(undefined);
    render(
      <AuthContext.Provider value={{ token: null, user: null, login: loginMock, logout: jest.fn() }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText(/senha/i), { target: { value: '123' } });
    fireEvent.click(screen.getByText(/Entrar/i));

    await waitFor(() => expect(loginMock).toHaveBeenCalled());
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  test('exibe erro se login falhar', async () => {
    const loginMock = jest.fn().mockRejectedValue(new Error('fail'));
    render(
      <AuthContext.Provider value={{ token: null, user: null, login: loginMock, logout: jest.fn() }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.click(screen.getByText(/Entrar/i));
    await waitFor(() => expect(loginMock).toHaveBeenCalled());
    expect(screen.getByText('Erro ao fazer login')).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
