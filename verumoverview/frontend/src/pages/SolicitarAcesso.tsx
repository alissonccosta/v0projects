import { useState } from 'react';
import api from '../services/api';

export default function SolicitarAcesso() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/auth/solicitar', { nome, email });
      setEnviado(true);
    } catch (err) {
      console.error(err);
      setErro('Erro ao enviar solicitação');
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-background text-gray-900 dark:text-dark-text p-6 rounded shadow-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-secondary">Pedido enviado</h1>
          <p>Em breve você receberá um e-mail com mais instruções.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-background p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-background text-gray-900 dark:text-dark-text p-6 rounded shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-center text-2xl font-bold text-secondary">Solicitar Acesso</h1>
        {erro && <p className="text-red-600">{erro}</p>}
        <div>
          <label htmlFor="nome" className="block mb-1">Nome</label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary dark:bg-dark-background"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary dark:bg-dark-background"
            required
          />
        </div>
        <button type="submit" className="w-full bg-secondary text-white px-4 py-2 rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-secondary">
          Enviar
        </button>
      </form>
    </div>
  );
}
