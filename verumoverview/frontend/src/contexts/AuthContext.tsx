import { createContext, useState, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: number;
  permissoes: string[];
}

interface AuthContextData {
  token: string | null;
  user: User | null;
  login(email: string, senha: string): Promise<void>;
  logout(): void;
}

export const AuthContext = createContext<AuthContextData>({
  token: null,
  user: null,
  async login() {},
  logout() {}
});

function decodeToken(token: string): User | null {
  try {
    const base64 = token.split('.')[1];
    const payload = JSON.parse(atob(base64));
    return { id: payload.id, permissoes: payload.permissoes };
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  async function login(email: string, senha: string) {
    const response = await api.post('/auth/login', { email, senha });
    const received = response.data.token;
    setToken(received);
    setUser(decodeToken(received));
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
