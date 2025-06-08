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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-primary p-6 rounded-lg shadow-md w-80">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border border-secondary p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <div>
            <label htmlFor="senha" className="block text-sm font-medium">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="border border-secondary p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <button
            type="submit"
            className="bg-secondary text-white px-4 py-2 rounded w-full"
          >
            Entrar
          </button>
          <p className="text-sm text-center">
            Não possui acesso?{' '}
            <Link to="/solicitar-acesso" className="text-secondary underline">
              Solicitar acesso
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
