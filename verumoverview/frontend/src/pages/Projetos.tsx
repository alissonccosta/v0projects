import { useEffect, useState } from 'react';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  getNextProjectCode
} from '../services/projects';
import { logAction } from '../services/logger';
import BackButton from '../components/BackButton';
import Modal from '../components/Modal';
import Badge from '../components/ui/Badge';
import { ArrowUpDown, Plus, Trash, Pencil } from 'lucide-react';

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
  status: 'Backlog',
  data_inicio_prevista: '',
  data_fim_prevista: '',
  prioridade: 'Média'
};

export default function Projetos() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [filters, setFilters] = useState({ nome: '', codigo: '', inicio: '', fim: '' });
  const [sort, setSort] = useState<{ column: string; asc: boolean }>({ column: '', asc: true });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const errs: Record<string, string> = {};
    if (!editing.nome.trim()) errs.nome = 'Nome é obrigatório';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
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

  async function openNewProject() {
    const code = await getNextProjectCode();
    setEditing({ ...emptyProject, codigo_projeto: code });
  }

  function toggleSort(column: string) {
    setSort(prev => ({ column, asc: prev.column === column ? !prev.asc : true }));
  }

  const filtered = projects.filter(p => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (filters.nome && !p.nome.toLowerCase().includes(filters.nome.toLowerCase())) return false;
    if (filters.codigo && !(p.codigo_projeto || '').includes(filters.codigo)) return false;
    if (filters.inicio && !(p.data_inicio_prevista || '').includes(filters.inicio)) return false;
    if (filters.fim && !(p.data_fim_prevista || '').includes(filters.fim)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sort.column) return 0;
    const valA = (a as any)[sort.column] || '';
    const valB = (b as any)[sort.column] || '';
    if (valA < valB) return sort.asc ? -1 : 1;
    if (valA > valB) return sort.asc ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-xl font-bold">Projetos</h1>
        </div>
        <button
          className="flex items-center gap-1 bg-secondary text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={openNewProject}
        >
          <Plus size={16} /> Novo Projeto
        </button>
      </div>

      <div>
        <label className="mr-2">Status:</label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border p-1 rounded focus:outline-none focus:ring-2 focus:ring-secondary">
          <option value="">Todos</option>
          <option>Backlog</option>
          <option>Documentação</option>
          <option>Execução</option>
          <option>Acompanhamento</option>
          <option>Handoff</option>
          <option>Sustentação</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-dark-background text-sm rounded shadow">
          <thead>
            <tr className="bg-gray-100 dark:bg-dark-background">
              <th className="p-2 text-left cursor-pointer" onClick={() => toggleSort('nome')}>
                Nome <ArrowUpDown className="inline w-4 h-4" />
              </th>
              <th className="p-2 text-left cursor-pointer" onClick={() => toggleSort('codigo_projeto')}>
                Código <ArrowUpDown className="inline w-4 h-4" />
              </th>
              <th className="p-2 text-left cursor-pointer" onClick={() => toggleSort('status')}>
                Status <ArrowUpDown className="inline w-4 h-4" />
              </th>
              <th className="p-2 text-left cursor-pointer" onClick={() => toggleSort('data_inicio_prevista')}>
                Início <ArrowUpDown className="inline w-4 h-4" />
              </th>
              <th className="p-2 text-left cursor-pointer" onClick={() => toggleSort('data_fim_prevista')}>
                Fim <ArrowUpDown className="inline w-4 h-4" />
              </th>
              <th className="p-2 text-left">Ações</th>
            </tr>
            <tr>
              <th className="p-1"><input className="border p-1 rounded w-full" value={filters.nome} onChange={e => setFilters({ ...filters, nome: e.target.value })} /></th>
              <th className="p-1"><input className="border p-1 rounded w-full" value={filters.codigo} onChange={e => setFilters({ ...filters, codigo: e.target.value })} /></th>
              <th className="p-1"></th>
              <th className="p-1"><input className="border p-1 rounded w-full" value={filters.inicio} onChange={e => setFilters({ ...filters, inicio: e.target.value })} /></th>
              <th className="p-1"><input className="border p-1 rounded w-full" value={filters.fim} onChange={e => setFilters({ ...filters, fim: e.target.value })} /></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(p => (
              <tr key={p.id_projeto} className="border-t">
                <td className="p-2">{p.nome}</td>
                <td className="p-2">{p.codigo_projeto}</td>
                <td className="p-2">
                  <Badge variant="status" value={p.status || ''} />
                </td>
                <td className="p-2">{p.data_inicio_prevista}</td>
                <td className="p-2">{p.data_fim_prevista}</td>
                <td className="p-2 space-x-2">
                  <button aria-label="Editar" className="text-blue-600 inline-flex items-center" onClick={() => setEditing({ ...p })}>
                    <Pencil size={14} className="mr-1" />Editar
                  </button>
                  <button aria-label="Excluir" className="text-red-600 inline-flex items-center" onClick={() => handleDelete(p.id_projeto)}>
                    <Trash size={14} className="mr-1" />Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!editing} title={editing?.id_projeto ? 'Editar Projeto' : 'Novo Projeto'} onClose={() => setEditing(null)}>
        {editing && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block">Nome</label>
            <input
              type="text"
              className={`border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary ${errors.nome ? 'input-error' : ''}`}
              value={editing.nome}
              onChange={e => {
                setEditing({ ...editing, nome: e.target.value });
                if (errors.nome) setErrors({ ...errors, nome: '' });
              }}
              required
            />
            {errors.nome && <span className="error-message">{errors.nome}</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block">Código</label>
              <input
                type="text"
                className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                value={editing.codigo_projeto}
                onChange={e => setEditing({ ...editing, codigo_projeto: e.target.value })}
                disabled
              />
            </div>
            <div>
              <label className="block">Status</label>
              <select
                className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                value={editing.status}
                onChange={e => setEditing({ ...editing, status: e.target.value })}
              >
                <option>Backlog</option>
                <option>Documentação</option>
                <option>Execução</option>
                <option>Acompanhamento</option>
                <option>Handoff</option>
                <option>Sustentação</option>
              </select>
            </div>
            <div>
              <label className="block">Início Previsto</label>
              <input
                type="date"
                className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                value={editing.data_inicio_prevista || ''}
                onChange={e => setEditing({ ...editing, data_inicio_prevista: e.target.value })}
              />
            </div>
            <div>
              <label className="block">Fim Previsto</label>
              <input
                type="date"
                className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                value={editing.data_fim_prevista || ''}
                onChange={e => setEditing({ ...editing, data_fim_prevista: e.target.value })}
              />
            </div>
            <div>
              <label className="block">Prioridade</label>
              <select
                className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                value={editing.prioridade}
                onChange={e => setEditing({ ...editing, prioridade: e.target.value })}
              >
                <option>Emergencial</option>
                <option>Muito Alta</option>
                <option>Alta</option>
                <option>Média</option>
                <option>Baixa</option>
              </select>
            </div>
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
      </Modal>
    </div>
  );
}
