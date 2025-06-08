import { useEffect, useState, useContext } from 'react';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  getNextProjectCode
} from '../services/projects';
import { logAction } from '../services/logger';
import BackButton from '../components/modules/BackButton';
import Modal from '../components/modules/Modal';
import { ToastContext } from '../hooks/ToastContext';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { DataTable, Column } from '../components/ui/Table';

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
          <DataTable
            data={projects}
            columns={columns}
            rowKey={p => p.id_projeto}
            globalSearch
            rowsPerPage={10}
          />
        )}
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
              <Input
                type="date"
                className="p-1"
                value={editing.data_inicio_prevista || ''}
                onChange={e => setEditing({ ...editing, data_inicio_prevista: e.target.value })}
              />
            </div>
            <div>
              <label className="block">Fim Previsto</label>
              <Input
                type="date"
                className="p-1"
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
            <Button type="submit" className="py-1">
              Salvar
            </Button>
          </div>
        </form>
        )}
      </Modal>
    </div>
  );
}
