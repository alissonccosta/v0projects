import { useEffect, useState, useContext } from 'react';
import {
  fetchActivities,
  createActivity,
  updateActivity,
  deleteActivity
} from '../services/activities';
import { logAction } from '../services/logger';
import BackButton from '../components/modules/BackButton';
import { ToastContext } from '../hooks/ToastContext';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import InputDate from '../components/ui/InputDate';
import TimeInput from '../components/ui/TimeInput';
import Badge from '../components/ui/Badge';
import Modal from '../components/modules/Modal';
import { Table, THead, Th, Td } from '../components/ui/Table';
import TimeDiffIndicator from '../components/modules/TimeDiffIndicator';
import { minutesToTime } from '../utils/time';
import Card from '../components/ui/Card';
import { formatDate } from '../utils/date';
import { DataTable, Column } from '../components/ui/Table';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Modal from '../components/modules/Modal';
import {
  fetchProjects,
  createProject,
  getNextProjectCode
} from '../services/projects';

interface Activity {
  id_atividade: string;
  titulo: string;
  status?: string;
  data_meta?: string;
  data_limite?: string;
  /** minutos */
  horas_estimadas?: number;
  horas_gastas?: number;
  prioridade?: string;
  responsavel?: number;
}

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

const emptyActivity: Activity = {
  id_atividade: '',
  titulo: '',
  status: 'Nao Iniciada',
  data_meta: '',
  data_limite: '',
  horas_estimadas: 0,
  horas_gastas: 0,
  prioridade: 'Média',
  responsavel: undefined
};

export default function Atividades() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectModal, setProjectModal] = useState(false);
  const [newProject, setNewProject] = useState<Project>(emptyProject);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { showToast } = useContext(ToastContext);

  function deadlineClass(date?: string) {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    const diff = d.getTime() - today.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    if (diff < 0) return 'bg-red-50 text-red-800';
    if (diff <= 3 * dayMs) return 'bg-yellow-50 text-yellow-800';
    return 'bg-green-50 text-green-800';
  }

  useEffect(() => {
    load();
    loadProjects();
  }, []);

  async function load() {
    const data = await fetchActivities();
    setActivities(data);
    setLoading(false);
  }

  async function loadProjects() {
    const data = await fetchProjects();
    setProjects(data);
  }

  async function openNewProject() {
    const code = await getNextProjectCode();
    setNewProject({ ...emptyProject, codigo_projeto: code });
    setProjectModal(true);
  }

  async function handleProjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newProject.nome.trim()) return;
    const created = await createProject(newProject);
    setProjectModal(false);
    loadProjects();
    if (editing) {
      setEditing({ ...editing, id_projeto: created.id_projeto });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const errs: Record<string, string> = {};
    if (!editing.titulo.trim()) errs.titulo = 'Título é obrigatório';
    if (!editing.id_projeto) errs.id_projeto = 'Projeto é obrigatório';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    if (editing.id_atividade) {
      await updateActivity(editing.id_atividade, editing);
      logAction('update_activity', { id: editing.id_atividade });
      showToast('Atividade atualizada com sucesso');
    } else {
      const created = await createActivity(editing);
      logAction('create_activity', { id: created.id_atividade });
      showToast('Atividade criada com sucesso');
    }
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir atividade?')) return;
    await deleteActivity(id);
    logAction('delete_activity', { id });
    showToast('Atividade excluída com sucesso');
    load();
  }


  const columns: Column<Activity>[] = [
    { key: 'titulo', header: 'Título', sortable: true, filterType: 'text' },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterType: 'select',
      render: a => <Badge variant="status" value={a.status || ''} />,
    },
    { key: 'data_meta', header: 'Meta', sortable: true },
    { key: 'data_limite', header: 'Limite', sortable: true },
    {
      key: 'horas',
      header: 'Horas',
      render: a => (
        <span>{a.horas_gastas || 0}/{a.horas_estimadas}</span>
      ),
    },
    {
      key: 'acoes',
      header: 'Ações',
      render: a => (
        <div className="flex gap-2">
          <button aria-label="Editar" onClick={() => setEditing({ ...a })}>
            <PencilSquareIcon className="w-5 h-5 text-blue-600" />
          </button>
          <button aria-label="Excluir" onClick={() => handleDelete(a.id_atividade)}>
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
          <h1 className="text-2xl font-semibold text-secondary mb-4">Atividades</h1>
        </div>
        <Button onClick={() => setEditing({ ...emptyActivity })}>
          Nova Atividade
        </Button>
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
      <Card title="Lista de Atividades">
        <div className="overflow-x-auto">
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <Table>
              <THead>
                <tr>
                  <Th>Título</Th>
                  <Th>Status</Th>
                  <Th>Responsável</Th>
                  <Th>Meta</Th>
                  <Th>Limite</Th>
                  <Th>Horas</Th>
                  <Th>Ações</Th>
                </tr>
              </THead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id_atividade} className="border-t hover:bg-gray-50 transition-colors">
                    <Td>{a.titulo}</Td>
                    <Td>
                      <Badge variant="status" value={a.status || ''} />
                    </Td>
                    <Td>
                      <span className="px-2 py-1 rounded bg-purple-50 text-secondary">
                        {a.responsavel || 'N/A'}
                      </span>
                    </Td>
                    <Td className={deadlineClass(a.data_meta)}>{a.data_meta}</Td>
                    <Td className={deadlineClass(a.data_limite)}>{a.data_limite}</Td>
                    <Td>{a.horas_gastas || 0}/{a.horas_estimadas}</Td>
                    <Td className="space-x-2">
                      <button aria-label="Editar" className="text-blue-600" onClick={() => setEditing({ ...a })}>Editar</button>
                      <button aria-label="Excluir" className="text-red-600" onClick={() => handleDelete(a.id_atividade)}>Excluir</button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </Card>
      <div className="overflow-x-auto">
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : (

          <>
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
                    <td className="p-2">
                      <Badge variant="status" value={a.status || ''} />
                    </td>
                    <td className="p-2">{a.data_meta}</td>
                    <td className="p-2">{a.data_limite}</td>
                    <td className="p-2 flex items-center gap-2">
                      {minutesToTime(a.horas_gastas || 0)}/{minutesToTime(a.horas_estimadas || 0)}
                      <TimeDiffIndicator estimado={a.horas_estimadas || 0} gasto={a.horas_gastas || 0} />
                    </td>
                    <td className="p-2 space-x-2">
                      <button aria-label="Editar" className="text-blue-600" onClick={() => setEditing({ ...a })}>Editar</button>
                      <button aria-label="Excluir" className="text-red-600" onClick={() => handleDelete(a.id_atividade)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <DataTable
              data={activities}
              columns={columns}
              rowKey={a => a.id_atividade}
              globalSearch
              rowsPerPage={10}
            />
          </>
        )}
      </div>

      <Modal isOpen={!!editing} title={editing?.id_atividade ? 'Editar Atividade' : 'Nova Atividade'} onClose={() => setEditing(null)}>
        {editing && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block">Título</label>
            <Input
              type="text"
              className="p-1"
              value={editing.titulo}
              onChange={e => {
                setEditing({ ...editing, titulo: e.target.value });
                if (errors.titulo) setErrors({ ...errors, titulo: '' });
              }}
              required
              error={errors.titulo}
            />
            {errors.titulo && <span className="error-message">{errors.titulo}</span>}
          </div>
          <div>
            <label className="block">Projeto</label>
            <select
              className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
              value={editing.id_projeto || ''}
              onChange={e => {
                if (e.target.value === 'new') {
                  openNewProject();
                } else {
                  setEditing({ ...editing, id_projeto: e.target.value });
                }
              }}
            >
              <option value="">Selecione</option>
              {projects.map(p => (
                <option key={p.id_projeto} value={p.id_projeto}>{p.nome}</option>
              ))}
              <option value="new">Novo Projeto...</option>
            </select>
            {errors.id_projeto && <span className="error-message">{errors.id_projeto}</span>}
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
              <InputDate
                className="p-1"
                value={editing.data_meta || ''}
                onChange={value => setEditing({ ...editing, data_meta: value })}
              />
            </div>
            <div className="flex-1">
              <label className="block">Data Limite</label>
              <InputDate
                className="p-1"
                value={editing.data_limite || ''}
                onChange={value => setEditing({ ...editing, data_limite: value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block">Horas Estimadas</label>
              <TimeInput
                value={editing.horas_estimadas || 0}
                onChange={v => setEditing({ ...editing, horas_estimadas: v })}
                className="p-1"
              />
            </div>
            <div className="flex-1">
              <label className="block">Horas Gastas</label>
              <TimeInput
                value={editing.horas_gastas || 0}
                onChange={v => setEditing({ ...editing, horas_gastas: v })}
                className="p-1"
              />
            </div>
          </div>
          <div>
            <label className="block">Prioridade</label>
            <select className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary" value={editing.prioridade}
              onChange={e => setEditing({ ...editing, prioridade: e.target.value })}>
              <option>Emergencial</option>
              <option>Muito Alta</option>
              <option>Alta</option>
              <option>Média</option>
              <option>Baixa</option>
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
      </Modal>
      <Modal isOpen={projectModal} title="Novo Projeto" onClose={() => setProjectModal(false)}>
        <form onSubmit={handleProjectSubmit} className="space-y-3">
          <div>
            <label className="block">Nome</label>
            <Input
              type="text"
              className="p-1"
              value={newProject.nome}
              onChange={e => setNewProject({ ...newProject, nome: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block">Código</label>
              <Input
                type="text"
                className="p-1"
                value={newProject.codigo_projeto}
                onChange={e => setNewProject({ ...newProject, codigo_projeto: e.target.value })}
                disabled
              />
            </div>
            <div>
              <label className="block">Status</label>
              <select
                className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                value={newProject.status}
                onChange={e => setNewProject({ ...newProject, status: e.target.value })}
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
                value={newProject.data_inicio_prevista || ''}
                onChange={e => setNewProject({ ...newProject, data_inicio_prevista: e.target.value })}
              />
            </div>
            <div>
              <label className="block">Fim Previsto</label>
              <Input
                type="date"
                className="p-1"
                value={newProject.data_fim_prevista || ''}
                onChange={e => setNewProject({ ...newProject, data_fim_prevista: e.target.value })}
              />
            </div>
            <div>
              <label className="block">Prioridade</label>
              <select
                className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                value={newProject.prioridade}
                onChange={e => setNewProject({ ...newProject, prioridade: e.target.value })}
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
            <button type="button" onClick={() => setProjectModal(false)} className="border border-secondary text-secondary px-4 py-1 rounded hover:bg-purple-50">Cancelar</button>
            <Button type="submit" className="py-1">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
