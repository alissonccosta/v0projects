import { useState } from 'react';
import { solicitarAcesso } from '../services/accessRequests';
import BackButton from '../components/modules/BackButton';

export default function SolicitarAcesso() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      setErro('Email inválido');
      return;
    }
    setErro('');
    await solicitarAcesso(email);
    setEnviado(true);
  }

  if (enviado) {
    return <div className="p-4">Solicitação enviada!</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-2">
      <BackButton />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => {
          setEmail(e.target.value);
          if (erro) setErro('');
        }}
        className={`border p-2 w-full ${erro ? 'input-error' : ''}`}
        required
      />
      {erro && <span className="error-message">{erro}</span>}
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">
        Solicitar Acesso
      </button>
    </form>
  );
}
