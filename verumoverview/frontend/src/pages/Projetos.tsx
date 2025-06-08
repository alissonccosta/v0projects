import { useEffect, useState } from 'react';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject
} from '../services/projects';
import { logAction } from '../services/logger';

interface Project {
  id_projeto: string;
  nome: string;
  codigo_projeto?: string;
  status?: string;
  data_inicio_prevista?: string;
  data_fim_prevista?: string;
  prioridade?: string;
}

const emptyProject: Project = {
  id_projeto: '',
  nome: '',
  codigo_projeto: '',
  status: 'Planejado',
  data_inicio_prevista: '',
  data_fim_prevista: '',
  prioridade: 'Media'
};

export default function Projetos() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await fetchProjects();
    setProjects(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (editing.id_projeto) {
      await updateProject(editing.id_projeto, editing);
      logAction('update_project', { id: editing.id_projeto });
    } else {
      const created = await createProject(editing);
      logAction('create_project', { id: created.id_projeto });
    }
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir projeto?')) return;
    await deleteProject(id);
    logAction('delete_project', { id });
    load();
  }

  const filtered = filter
    ? projects.filter(p => p.status === filter)
    : projects;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Projetos</h1>
        <button
          className="bg-secondary text-white px-4 py-2 rounded"
          onClick={() => setEditing({ ...emptyProject })}
        >
          Novo Projeto
        </button>
      </div>

      <div>
        <label className="mr-2">Status:</label>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border p-1">
          <option value="">Todos</option>
          <option value="Planejado">Planejado</option>
          <option value="Em Andamento">Em Andamento</option>
          <option value="Concluído">Concluído</option>
          <option value="Em Risco">Em Risco</option>
        </select>
      </div>

      <table className="min-w-full bg-white dark:bg-dark-background text-sm">
        <thead>
          <tr>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Código</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Início</th>
            <th className="p-2 text-left">Fim</th>
            <th className="p-2 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p.id_projeto} className="border-t">
              <td className="p-2">{p.nome}</td>
              <td className="p-2">{p.codigo_projeto}</td>
              <td className="p-2">{p.status}</td>
              <td className="p-2">{p.data_inicio_prevista}</td>
              <td className="p-2">{p.data_fim_prevista}</td>
              <td className="p-2 space-x-2">
                <button className="text-blue-600" onClick={() => setEditing({ ...p })}>Editar</button>
                <button className="text-red-600" onClick={() => handleDelete(p.id_projeto)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-background p-4 rounded shadow space-y-2">
          <div>
            <label className="block">Nome</label>
            <input
              type="text"
              className="border p-1 w-full"
              value={editing.nome}
              onChange={e => setEditing({ ...editing, nome: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block">Código</label>
            <input
              type="text"
              className="border p-1 w-full"
              value={editing.codigo_projeto}
              onChange={e => setEditing({ ...editing, codigo_projeto: e.target.value })}
            />
          </div>
          <div>
            <label className="block">Status</label>
            <select
              className="border p-1 w-full"
              value={editing.status}
              onChange={e => setEditing({ ...editing, status: e.target.value })}
            >
              <option>Planejado</option>
              <option>Em Andamento</option>
              <option>Concluído</option>
              <option>Em Risco</option>
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block">Início Previsto</label>
              <input
                type="date"
                className="border p-1 w-full"
                value={editing.data_inicio_prevista || ''}
                onChange={e => setEditing({ ...editing, data_inicio_prevista: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className="block">Fim Previsto</label>
              <input
                type="date"
                className="border p-1 w-full"
                value={editing.data_fim_prevista || ''}
                onChange={e => setEditing({ ...editing, data_fim_prevista: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block">Prioridade</label>
            <select
              className="border p-1 w-full"
              value={editing.prioridade}
              onChange={e => setEditing({ ...editing, prioridade: e.target.value })}
            >
              <option>Alta</option>
              <option>Média</option>
              <option>Baixa</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="border px-4 py-1 rounded">
              Cancelar
            </button>
            <button type="submit" className="bg-secondary text-white px-4 py-1 rounded">
              Salvar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
