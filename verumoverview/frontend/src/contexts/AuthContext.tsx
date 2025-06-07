import { createContext, useState, ReactNode } from 'react';
import api from '../services/api';

interface AuthContextData {
  token: string | null;
  login(email: string, senha: string): Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({
  token: null,
  async login() {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  async function login(email: string, senha: string) {
    const response = await api.post('/auth/login', { email, senha });
    setToken(response.data.token);
  }

  return (
    <AuthContext.Provider value={{ token, login }}>
      {children}
    </AuthContext.Provider>
  );
}
