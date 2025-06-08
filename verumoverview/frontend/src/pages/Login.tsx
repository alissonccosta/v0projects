import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { logAction } from '../services/logger';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) {
      setErro('Email e senha são obrigatórios');
      return;
    }
    setErro('');
    await login(email, senha);
    logAction('login');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => {
          setEmail(e.target.value);
          if (erro) setErro('');
        }}
        className={`border p-2 mb-2 w-full ${erro ? 'input-error' : ''}`}
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={e => {
          setSenha(e.target.value);
          if (erro) setErro('');
        }}
        className={`border p-2 mb-2 w-full ${erro ? 'input-error' : ''}`}
      />
      {erro && <span className="error-message">{erro}</span>}
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">
        Entrar
      </button>
      <p className="mt-2">
        <Link to="/solicitar-acesso" className="text-blue-600">
          Solicitar acesso
        </Link>
      </p>
    </form>
  );
}
