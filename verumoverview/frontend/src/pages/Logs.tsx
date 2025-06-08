import { useEffect, useState } from 'react';
import { fetchLogs } from '../services/auditLogs';
import { formatDateTime } from '../utils/date';
import BackButton from '../components/modules/BackButton';
import Skeleton from '../components/ui/Skeleton';
import { Table, THead, Th } from '../components/ui/Table';

interface Log {
  id: number;
  usuario_id?: number;
  email?: string;
  acao: string;
  criado_em: string;
}

export default function Logs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await fetchLogs();
    setLogs(data);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BackButton />
        <h1 className="text-2xl font-semibold text-secondary mb-4">Logs de Auditoria</h1>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <Skeleton className="h-60 w-full" />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Usuário</Th>
                <Th>Ação</Th>
                <Th>Data</Th>
              </tr>
            </THead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-t">
                  <td className="p-2">{l.email || l.usuario_id}</td>
                  <td className="p-2">{l.acao}</td>
                  <td className="p-2">{formatDateTime(l.criado_em)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
