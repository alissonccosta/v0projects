import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
jest.mock('../services/logger', () => ({ logAction: jest.fn() }));
const MockAuthContext = React.createContext<any>(null);
jest.mock('../contexts/AuthContext', () => ({ AuthContext: MockAuthContext }));
import Login from '../pages/Login';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

function renderWithProviders(ui: React.ReactElement, loginMock: jest.Mock) {
  return render(
    <MockAuthContext.Provider value={{ token: null, user: null, login: loginMock, logout: jest.fn() }}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={ui} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </MockAuthContext.Provider>
  );
}

test('renderiza o formulário de login', () => {
  const loginMock = jest.fn();
  renderWithProviders(<Login />, loginMock);
  expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/senha/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
});

test('exibe mensagem de erro ao receber 401', async () => {
  const loginMock = jest.fn().mockRejectedValue({ response: { status: 401 } });
  renderWithProviders(<Login />, loginMock);

  await userEvent.type(screen.getByPlaceholderText(/email/i), 'user@example.com');
  await userEvent.type(screen.getByPlaceholderText(/senha/i), '123');
  await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

  expect(await screen.findByText(/credenciais inválidas/i)).toBeInTheDocument();
});

test('redireciona para / em caso de sucesso', async () => {
  const loginMock = jest.fn().mockResolvedValue(undefined);
  renderWithProviders(<Login />, loginMock);

  await userEvent.type(screen.getByPlaceholderText(/email/i), 'user@example.com');
  await userEvent.type(screen.getByPlaceholderText(/senha/i), '123');
  await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

  expect(await screen.findByText('Home')).toBeInTheDocument();
});
