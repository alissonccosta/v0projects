import { createContext, useState, ReactNode, useEffect } from 'react';
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

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      setToken(stored);
      api.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
      setUser(decodeToken(stored));
    }
  }, []);

  async function login(email: string, senha: string) {
    const response = await api.post('/auth/login', { email, senha });
    const received = response.data.token;
    setToken(received);
    localStorage.setItem('token', received);
    api.defaults.headers.common['Authorization'] = `Bearer ${received}`;
    setUser(decodeToken(received));
  }

  function logout() {
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
