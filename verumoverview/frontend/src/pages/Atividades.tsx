import { useEffect, useState } from 'react';
import {
  fetchActivities,
  createActivity,
  updateActivity,
  deleteActivity
} from '../services/activities';
import { logAction } from '../services/logger';
import BackButton from '../components/BackButton';
import { Table, THead, Th, Td } from '../components/ui/Table';

interface Activity {
  id_atividade: string;
  titulo: string;
  status?: string;
  data_meta?: string;
  data_limite?: string;
  horas_estimadas?: number;
  horas_gastas?: number;
  prioridade?: string;
}

const emptyActivity: Activity = {
  id_atividade: '',
  titulo: '',
  status: 'Nao Iniciada',
  data_meta: '',
  data_limite: '',
  horas_estimadas: 0,
  horas_gastas: 0,
  prioridade: 'Media'
};

export default function Atividades() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [filter, setFilter] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await fetchActivities();
    setActivities(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const errs: Record<string, string> = {};
    if (!editing.titulo.trim()) errs.titulo = 'Título é obrigatório';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    if (editing.id_atividade) {
      await updateActivity(editing.id_atividade, editing);
      logAction('update_activity', { id: editing.id_atividade });
    } else {
      const created = await createActivity(editing);
      logAction('create_activity', { id: created.id_atividade });
    }
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir atividade?')) return;
    await deleteActivity(id);
    logAction('delete_activity', { id });
    load();
  }

  const filtered = filter ? activities.filter(a => a.status === filter) : activities;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-xl font-bold">Atividades</h1>
        </div>
        <button className="bg-secondary text-white px-4 py-2 rounded hover:bg-purple-700" onClick={() => setEditing({ ...emptyActivity })}>
          Nova Atividade
        </button>
      </div>

      <div>
        <label className="mr-2">Status:</label>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border p-1 rounded focus:outline-none focus:ring-2 focus:ring-secondary">
          <option value="">Todos</option>
          <option>Nao Iniciada</option>
          <option>Em Andamento</option>
          <option>Concluida</option>
          <option>Em Risco</option>
          <option>Bloqueada</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <THead>
            <tr>
              <Th>Título</Th>
              <Th>Status</Th>
              <Th>Meta</Th>
              <Th>Limite</Th>
              <Th>Horas</Th>
              <Th>Ações</Th>
            </tr>
          </THead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id_atividade} className="border-t">
                <td className="p-2">{a.titulo}</td>
                <td className="p-2">{a.status}</td>
                <td className="p-2">{a.data_meta}</td>
                <td className="p-2">{a.data_limite}</td>
                <td className="p-2">{a.horas_gastas || 0}/{a.horas_estimadas}</td>
                <td className="p-2 space-x-2">
                  <button aria-label="Editar" className="text-blue-600" onClick={() => setEditing({ ...a })}>Editar</button>
                  <button aria-label="Excluir" className="text-red-600" onClick={() => handleDelete(a.id_atividade)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {editing && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-background p-4 rounded shadow space-y-2">
          <div>
            <label className="block">Título</label>
            <input
              type="text"
              className={`border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary ${errors.titulo ? 'input-error' : ''}`}
              value={editing.titulo}
              onChange={e => {
                setEditing({ ...editing, titulo: e.target.value });
                if (errors.titulo) setErrors({ ...errors, titulo: '' });
              }}
              required
            />
            {errors.titulo && <span className="error-message">{errors.titulo}</span>}
          </div>
          <div>
            <label className="block">Status</label>
            <select className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary" value={editing.status}
              onChange={e => setEditing({ ...editing, status: e.target.value })}>
              <option>Nao Iniciada</option>
              <option>Em Andamento</option>
              <option>Concluida</option>
              <option>Em Risco</option>
              <option>Bloqueada</option>
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block">Data Meta</label>
              <input type="date" className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary" value={editing.data_meta || ''}
                onChange={e => setEditing({ ...editing, data_meta: e.target.value })} />
            </div>
            <div className="flex-1">
              <label className="block">Data Limite</label>
              <input type="date" className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary" value={editing.data_limite || ''}
                onChange={e => setEditing({ ...editing, data_limite: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block">Horas Estimadas</label>
              <input type="number" className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary" value={editing.horas_estimadas || 0}
                onChange={e => setEditing({ ...editing, horas_estimadas: Number(e.target.value) })} />
            </div>
            <div className="flex-1">
              <label className="block">Horas Gastas</label>
              <input type="number" className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary" value={editing.horas_gastas || 0}
                onChange={e => setEditing({ ...editing, horas_gastas: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="block">Prioridade</label>
            <select className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary" value={editing.prioridade}
              onChange={e => setEditing({ ...editing, prioridade: e.target.value })}>
              <option>Alta</option>
              <option>Media</option>
              <option>Baixa</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="border border-secondary text-secondary px-4 py-1 rounded hover:bg-purple-50">
              Cancelar
            </button>
            <button type="submit" className="bg-secondary text-white px-4 py-1 rounded hover:bg-purple-700">
              Salvar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
