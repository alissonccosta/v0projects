import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { logAction } from '../services/logger';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    try {
      await login(email, senha);
      logAction('login');
      navigate('/');
    } catch (err: any) {
      if ((err as any).response?.status === 401) {
        setErro('Credenciais inválidas');
      } else {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary dark:bg-dark-background">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-background p-6 rounded shadow space-y-2 w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            if (erro) setErro('');
          }}
          className={`border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary ${erro ? 'input-error' : ''}`}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => {
            setSenha(e.target.value);
            if (erro) setErro('');
          }}
          className={`border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary ${erro ? 'input-error' : ''}`}
        />
        {erro && <span className="error-message">{erro}</span>}
        <button type="submit" className="bg-secondary text-white px-4 py-2 rounded hover:bg-purple-700 w-full">
          Entrar
        </button>
        {erro && <p className="text-red-500 mt-2">{erro}</p>}
        <p className="mt-2 text-center">
          <Link to="/solicitar-acesso" className="text-secondary hover:underline">
            Solicitar acesso
          </Link>
        </p>
      </form>
    </div>
  );
}
