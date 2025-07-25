import { useEffect, useState, useContext } from 'react';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  getNextProjectCode,
  fetchProjectActivities
} from '../services/projects';
import { logAction } from '../services/logger';
import BackButton from '../components/modules/BackButton';
import Modal from '../components/modules/Modal';
import { ToastContext } from '../hooks/ToastContext';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import { PlusIcon, PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import InputDate from '../components/ui/InputDate';
import { formatDate } from '../utils/date';
import { DataTable, Column } from '../components/ui/Table';
import Card from '../components/ui/Card';


interface Project {
  id_projeto: string;
  nome: string;
  codigo_projeto?: string;
  status?: string;
  data_inicio_prevista?: string;
  data_fim_prevista?: string;
  prioridade?: string;
}

interface Activity {
  id_atividade: string;
  titulo: string;
  status?: string;
  data_meta?: string;
  data_limite?: string;
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
  const [details, setDetails] = useState<Project | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [filters, setFilters] = useState({ nome: '', codigo: '', inicio: '', fim: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await fetchProjects();
    setProjects(data);
    setLoading(false);
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
      showToast('Projeto atualizado com sucesso');
    } else {
      const created = await createProject(editing);
      logAction('create_project', { id: created.id_projeto });
      showToast('Projeto criado com sucesso');
    }
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir projeto?')) return;
    await deleteProject(id);
    logAction('delete_project', { id });
    showToast('Projeto excluído com sucesso');
    load();
  }

  async function openNewProject() {
    const code = await getNextProjectCode();
    setEditing({ ...emptyProject, codigo_projeto: code });
  }

  async function openDetails(project: Project) {
    setDetails(project);
    const acts = await fetchProjectActivities(project.id_projeto);
    setActivities(acts);
  }

  const filtered = projects.filter(p =>
    (!statusFilter || (p.status || '') === statusFilter) &&
    p.nome.toLowerCase().includes(filters.nome.toLowerCase()) &&
    p.codigo_projeto?.toLowerCase().includes(filters.codigo.toLowerCase()) &&
    (!filters.inicio || (p.data_inicio_prevista || '').startsWith(filters.inicio)) &&
    (!filters.fim || (p.data_fim_prevista || '').startsWith(filters.fim))
  );

  const columns: Column<Project>[] = [
    { key: 'nome', header: 'Nome', sortable: true, filterType: 'text' },
    { key: 'codigo_projeto', header: 'Código', sortable: true, filterType: 'text' },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterType: 'select',
      render: p => <Badge variant="status" value={p.status || ''} />,
    },
    { key: 'data_inicio_prevista', header: 'Início', sortable: true },
    { key: 'data_fim_prevista', header: 'Fim', sortable: true },
    {
      key: 'acoes',
      header: 'Ações',
      render: p => (
        <div className="flex gap-2">
          <button aria-label="Detalhes" onClick={() => openDetails(p)}>
            <EyeIcon className="w-5 h-5 text-purple-600" />
          </button>
          <button aria-label="Editar" onClick={() => setEditing({ ...p })}>
            <PencilSquareIcon className="w-5 h-5 text-blue-600" />
          </button>
          <button aria-label="Excluir" onClick={() => handleDelete(p.id_projeto)}>
            <TrashIcon className="w-5 h-5 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  const activityColumns: Column<Activity>[] = [
    { key: 'titulo', header: 'Título' },
    { key: 'status', header: 'Status' },
    { key: 'data_meta', header: 'Meta' },
    { key: 'data_limite', header: 'Limite' }
  ];


  const sorted = [...filtered].sort((a, b) => a.nome.localeCompare(b.nome));

  const statusCounts = projects.reduce<Record<string, number>>((acc, p) => {
    const st = p.status || 'Indefinido';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl font-semibold text-secondary mb-4">Projetos</h1>
        </div>
        <Button onClick={openNewProject} className="flex items-center gap-1">
          <PlusIcon className="w-5 h-5" /> Novo Projeto
        </Button>
      </div>


      <div className="overflow-x-auto">
        {loading ? (
          <Skeleton className="h-60 w-full" />
        ) : (
          <>
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
              <th className="p-1">
                <Input
                  className="p-1"
                  value={filters.nome}
                  onChange={e => setFilters({ ...filters, nome: e.target.value })}
                />
              </th>
              <th className="p-1">
                <Input
                  className="p-1"
                  value={filters.codigo}
                  onChange={e => setFilters({ ...filters, codigo: e.target.value })}
                />
              </th>
              <th className="p-1"></th>
              <th className="p-1">
                <Input
                  className="p-1"
                  value={filters.inicio}
                  onChange={e => setFilters({ ...filters, inicio: e.target.value })}
                />
              </th>
              <th className="p-1">
                <Input
                  className="p-1"
                  value={filters.fim}
                  onChange={e => setFilters({ ...filters, fim: e.target.value })}
                />
              </th>
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
                <td className="p-2">{p.data_inicio_prevista ? formatDate(p.data_inicio_prevista) : ''}</td>
                <td className="p-2">{p.data_fim_prevista ? formatDate(p.data_fim_prevista) : ''}</td>
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
            <DataTable
              data={projects}
              columns={columns}
              rowKey={p => p.id_projeto}
              globalSearch
              rowsPerPage={10}
            />
          </>
        )}
      </div>
      <div className="md:grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="mr-2">Status:</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border p-1 rounded focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="">Todos</option>
              <option>Backlog</option>
              <option>Documentação</option>
              <option>Execução</option>
              <option>Acompanhamento</option>
              <option>Handoff</option>
              <option>Sustentação</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input
              placeholder="Nome"
              className="p-1"
              value={filters.nome}
              onChange={e => setFilters({ ...filters, nome: e.target.value })}
            />
            <Input
              placeholder="Código"
              className="p-1"
              value={filters.codigo}
              onChange={e => setFilters({ ...filters, codigo: e.target.value })}
            />
            <InputDate
              className="p-1"
              value={filters.inicio}
              onChange={value => setFilters({ ...filters, inicio: value })}
            />
            <InputDate
              className="p-1"
              value={filters.fim}
              onChange={value => setFilters({ ...filters, fim: value })}
            />
          </div>
          {loading ? (
            <Skeleton className="h-60 w-full" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {sorted.map(p => (
                <Card key={p.id_projeto} className="p-4 space-y-2">
                  <Card.Header
                    title={p.nome}
                    subtitle={p.codigo_projeto}
                    action={<Badge variant="status" value={p.status || ''} />}
                  />
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Início:</strong> {p.data_inicio_prevista || '-'}
                    </p>
                    <p>
                      <strong>Fim:</strong> {p.data_fim_prevista || '-'}
                    </p>
                  </div>
                  <Card.Footer>
                    <div className="flex justify-end gap-2">
                      <button
                        aria-label="Editar"
                        className="text-blue-600"
                        onClick={() => setEditing({ ...p })}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        aria-label="Excluir"
                        className="text-red-600"
                        onClick={() => handleDelete(p.id_projeto)}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </Card.Footer>
                </Card>
              ))}
            </div>
          )}
        </div>
        <aside className="space-y-4 mt-4 md:mt-0">
          <Card className="p-4" title="Resumo">
            <Card.Content>
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{projects.length}</span>
                </li>
                {Object.entries(statusCounts).map(([st, count]) => (
                  <li key={st} className="flex justify-between">
                    <span>{st}</span>
                    <span>{count}</span>
                  </li>
                ))}
              </ul>
            </Card.Content>
          </Card>
        </aside>
      </div>

      <Modal isOpen={!!editing} title={editing?.id_projeto ? 'Editar Projeto' : 'Novo Projeto'} onClose={() => setEditing(null)}>
        {editing && (
        <form onSubmit={handleSubmit} className="space-y-3">
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
            {errors.nome && <span className="error-message">{errors.nome}</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block">Código</label>
              <Input
                type="text"
                className="p-1"
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
              <InputDate
                className="p-1"
                value={editing.data_inicio_prevista || ''}
                onChange={value => setEditing({ ...editing, data_inicio_prevista: value })}
              />
            </div>
            <div>
              <label className="block">Fim Previsto</label>
              <InputDate
                className="p-1"
                value={editing.data_fim_prevista || ''}
                onChange={value => setEditing({ ...editing, data_fim_prevista: value })}
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
            <Button type="submit" className="py-1">
              Salvar
            </Button>
          </div>
        </form>
        )}
      </Modal>
      <Modal isOpen={!!details} title={details?.nome || ''} onClose={() => setDetails(null)}>
        <DataTable
          data={activities}
          columns={activityColumns}
          rowKey={a => a.id_atividade}
        />
      </Modal>
    </div>
  );
}
