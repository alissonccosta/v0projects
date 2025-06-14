import { useEffect, useState, useContext } from 'react';
import { fetchTimes, createTime, updateTime, deleteTime } from '../services/times';
import { fetchPeople } from '../services/people';
import { logAction } from '../services/logger';
import BackButton from '../components/modules/BackButton';
import { ToastContext } from '../hooks/ToastContext';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, THead, Th, Td } from '../components/ui/Table';

interface Time {
  id_time: string;
  nome: string;
  lider?: number;
  capacidade_total?: number;
  membros?: string[];
}

interface Person {
  id_pessoa: string;
  nome_completo: string;
}

const emptyTime: Time = {
  id_time: '',
  nome: '',
  lider: undefined,
  capacidade_total: 0,
  membros: []
};

export default function Times() {
  const [times, setTimes] = useState<Time[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [editing, setEditing] = useState<Time | null>(null);
  const [filter, setFilter] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    Promise.all([load(), loadPeople()]).then(() => setLoading(false));
  }, []);

  async function load() {
    const data = await fetchTimes();
    setTimes(data);
  }

  async function loadPeople() {
    const data = await fetchPeople();
    setPeople(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const errs: Record<string, string> = {};
    if (!editing.nome.trim()) errs.nome = 'Nome é obrigatório';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const payload = {
      ...editing,
      membros: editing.membros
    };
    if (editing.id_time) {
      await updateTime(editing.id_time, payload);
      logAction('update_time', { id: editing.id_time });
      showToast('Time atualizado com sucesso');
    } else {
      const created = await createTime(payload);
      logAction('create_time', { id: created.id_time });
      showToast('Time criado com sucesso');
    }
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir time?')) return;
    await deleteTime(id);
    logAction('delete_time', { id });
    showToast('Time excluído com sucesso');
    load();
  }

  const filtered = filter
    ? times.filter(t => t.nome.toLowerCase().includes(filter.toLowerCase()))
    : times;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl font-semibold text-secondary mb-4">Times</h1>
        </div>
        <Button onClick={() => setEditing({ ...emptyTime })}>
          Novo Time
        </Button>
      </div>

      <div>
        <label className="mr-2">Buscar:</label>
        <Input
          type="text"
          className="p-1"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <Skeleton className="h-60 w-full" />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Nome</Th>
                <Th>Líder</Th>
                <Th>Capacidade</Th>
                <Th>Membros</Th>
                <Th>Ações</Th>
              </tr>
            </THead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id_time} className="border-t">
                  <td className="p-2">{t.nome}</td>
                  <td className="p-2">{people.find(p => p.id_pessoa === String(t.lider))?.nome_completo || ''}</td>
                  <td className="p-2">{t.capacidade_total}</td>
                  <td className="p-2">{t.membros?.length || 0}</td>
                  <td className="p-2 space-x-2">
                    <button aria-label="Editar" className="text-blue-600" onClick={() => setEditing({ ...t })}>Editar</button>
                    <button aria-label="Excluir" className="text-red-600" onClick={() => handleDelete(t.id_time)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {editing && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-background p-4 rounded shadow space-y-2">
          <div>
            <label className="block">Nome</label>
            <Input
              type="text"
              className="p-1"
              value={editing.nome}
              onChange={e => {
                setEditing({ ...editing, nome: e.target.value });
                if (errors.nome) setErrors({ ...errors, nome: '' });
              }}
              required
              error={errors.nome}
            />
          </div>
          <div>
            <label className="block">Líder</label>
            <select
              className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
              value={editing.lider || ''}
              onChange={e => setEditing({ ...editing, lider: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">Selecione</option>
              {people.map(p => (
                <option key={p.id_pessoa} value={p.id_pessoa}>{p.nome_completo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block">Capacidade Total (h/sem)</label>
            <Input
              type="number"
              className="p-1"
              value={editing.capacidade_total || 0}
              onChange={e => setEditing({ ...editing, capacidade_total: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block">Membros</label>
            <select
              multiple
              className="border p-1 w-full h-32 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
              value={editing.membros as string[]}
              onChange={e => {
                const options = Array.from(e.target.selectedOptions).map(o => o.value);
                setEditing({ ...editing, membros: options });
              }}
            >
              {people.map(p => (
                <option key={p.id_pessoa} value={p.id_pessoa}>{p.nome_completo}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="border border-secondary text-secondary px-4 py-1 rounded hover:bg-purple-50">
              Cancelar
            </button>
            <Button type="submit" className="py-1">
              Salvar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
