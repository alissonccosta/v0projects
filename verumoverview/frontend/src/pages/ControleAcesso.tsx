import { useEffect, useState } from 'react';
import { fetchSolicitacoes, atualizarSolicitacao } from '../services/accessRequests';
import { logAction } from '../services/logger';
import BackButton from '../components/BackButton';

interface Solicitacao {
  id: number;
  email: string;
  status: string;
}

export default function ControleAcesso() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await fetchSolicitacoes();
    setSolicitacoes(data);
  }

  async function handle(id: number, status: string) {
    await atualizarSolicitacao(id, status);
    logAction('update_access_request', { id, status });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BackButton />
        <h1 className="text-xl font-bold">Controle de Acesso</h1>
      </div>
      <table className="min-w-full bg-white dark:bg-dark-background text-sm">
        <thead>
          <tr>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {solicitacoes.map(s => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.email}</td>
              <td className="p-2">{s.status}</td>
              <td className="p-2 space-x-2">
                {s.status === 'pendente' && (
                  <>
                    <button
                      onClick={() => handle(s.id, 'aprovado')}
                      className="text-blue-600"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => handle(s.id, 'rejeitado')}
                      className="text-red-600"
                    >
                      Rejeitar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
