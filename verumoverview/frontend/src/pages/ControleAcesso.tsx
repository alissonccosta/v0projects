import { useEffect, useState, useContext } from 'react';
import { fetchSolicitacoes, atualizarSolicitacao } from '../services/accessRequests';
import { logAction } from '../services/logger';
import BackButton from '../components/modules/BackButton';
import { ToastContext } from '../hooks/ToastContext';
import Skeleton from '../components/ui/Skeleton';
import { Table, THead, Th, Td } from '../components/ui/Table';

interface Solicitacao {
  id: number;
  email: string;
  status: string;
}

export default function ControleAcesso() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await fetchSolicitacoes();
    setSolicitacoes(data);
    setLoading(false);
  }

  async function handle(id: number, status: string) {
    await atualizarSolicitacao(id, status);
    logAction('update_access_request', { id, status });
    showToast('Solicitação atualizada');
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BackButton />
        <h1 className="text-2xl font-semibold text-secondary mb-4">Controle de Acesso</h1>
      </div>

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>Email</Th>
              <Th>Status</Th>
              <th className="p-2"></th>
            </tr>
          </THead>
          <tbody>
            {solicitacoes.map(s => (
              <tr key={s.id} className="border-t">
                <Td>{s.email}</Td>
                <Td>{s.status}</Td>
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
        </Table>
      )}
    </div>
  );
}
