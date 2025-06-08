import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { logAction } from '../services/logger';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, senha);
    logAction('login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-background p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-background p-6 rounded shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-center text-2xl font-bold text-secondary">VerumOverview</h1>
        <div>
          <label htmlFor="email" className="block mb-1">Email</label>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        <div>
          <label htmlFor="senha" className="block mb-1">Senha</label>
          <input
            id="senha"
            type="password"
            placeholder="••••••"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
            required
          />
        </div>
        <button type="submit" className="w-full bg-secondary text-white px-4 py-2 rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-secondary">
          Entrar
        </button>
        <p className="mt-2">
          <Link to="/solicitar-acesso" className="text-blue-600">
            Solicitar acesso
          </Link>
        </p>
      </form>
    </div>
  );
}
