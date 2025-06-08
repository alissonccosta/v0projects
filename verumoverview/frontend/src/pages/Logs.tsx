import { useEffect, useState } from 'react';
import { fetchLogs } from '../services/auditLogs';
import BackButton from '../components/modules/BackButton';
import Skeleton from '../components/ui/Skeleton';
import { DataTable, Column } from '../components/ui/Table';

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

  const columns: Column<Log>[] = [
    { key: 'email', header: 'Usuário', sortable: true, filterType: 'text', render: l => l.email || String(l.usuario_id) },
    { key: 'acao', header: 'Ação', sortable: true, filterType: 'text' },
    {
      key: 'criado_em',
      header: 'Data',
      sortable: true,
      render: l => new Date(l.criado_em).toLocaleString(),
    },
  ];

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
          <DataTable
            data={logs}
            columns={columns}
            rowKey={l => l.id}
            globalSearch
            rowsPerPage={10}
          />
        )}
      </div>
    </div>
  );
}
