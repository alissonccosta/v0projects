import { useEffect, useState, useContext } from 'react';
import {
  fetchPeople,
  createPerson,
  updatePerson,
  deletePerson
} from '../services/people';
import { logAction } from '../services/logger';
import BackButton from '../components/modules/BackButton';
import { ToastContext } from '../hooks/ToastContext';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { Table, THead} from '../components/ui/Table';

interface Person {
  id_pessoa: string;
  nome_completo: string;
  email: string;
  cargo_funcao?: string;
  time?: string;
  status?: string;
  engajamento?: number;
}

const emptyPerson: Person = {
  id_pessoa: '',
  nome_completo: '',
  email: '',
  cargo_funcao: '',
  time: '',
  status: 'Ativo',
  engajamento: 0
};

export default function Pessoas() {
  const [people, setPeople] = useState<Person[]>([]);
  const [editing, setEditing] = useState<Person | null>(null);
  const [filter, setFilter] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await fetchPeople();
      setPeople(data);
    } catch (err) {
      console.error(err);
      showToast('Erro ao carregar pessoas');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const errs: Record<string, string> = {};
    if (!editing.nome_completo.trim()) errs.nome_completo = 'Nome é obrigatório';
    if (!editing.email.trim()) errs.email = 'Email é obrigatório';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(editing.email)) errs.email = 'Email inválido';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    if (editing.id_pessoa) {
      await updatePerson(editing.id_pessoa, editing);
      logAction('update_person', { id: editing.id_pessoa });
      showToast('Pessoa atualizada com sucesso');
    } else {
      const created = await createPerson(editing);
      logAction('create_person', { id: created.id_pessoa });
      showToast('Pessoa criada com sucesso');
    }
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir pessoa?')) return;
    await deletePerson(id);
    logAction('delete_person', { id });
    showToast('Pessoa excluída com sucesso');
    load();
  }

  const filtered = filter ? people.filter(p => p.status === filter) : people;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl font-semibold text-secondary mb-4">Pessoas</h1>
        </div>
        <Button onClick={() => setEditing({ ...emptyPerson })}>
          Nova Pessoa
        </Button>
      </div>

      <div>
        <label className="mr-2">Status:</label>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border p-1 rounded focus:outline-none focus:ring-2 focus:ring-secondary">
          <option value="">Todos</option>
          <option>Ativo</option>
          <option>Licenca</option>
          <option>Ferias</option>
          <option>Desligado</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <Skeleton className="h-60 w-full" />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Nome</Th>
                <Th>Email</Th>
                <Th>Cargo</Th>
                <Th>Time</Th>
                <Th>Status</Th>
                <Th>Engajamento</Th>
                <Th>Ações</Th>
              </tr>
            </THead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id_pessoa} className="border-t">
                  <td className="p-2">{p.nome_completo}</td>
                  <td className="p-2">{p.email}</td>
                  <td className="p-2">{p.cargo_funcao}</td>
                  <td className="p-2">{p.time}</td>
                  <td className="p-2">
                    <Badge variant="status" value={p.status || ''} />
                  </td>
                  <td className="p-2">{p.engajamento}</td>
                  <td className="p-2 space-x-2">
                    <button aria-label="Editar" className="text-blue-600" onClick={() => setEditing({ ...p })}>Editar</button>
                    <button aria-label="Excluir" className="text-red-600" onClick={() => handleDelete(p.id_pessoa)}>Excluir</button>
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
            <label className="block">Nome Completo</label>
            <Input
              type="text"
              className="p-1"
              value={editing.nome_completo}
              onChange={e => {
                setEditing({ ...editing, nome_completo: e.target.value });
                if (errors.nome_completo) setErrors({ ...errors, nome_completo: '' });
              }}
              required
              error={errors.nome_completo}
            />
          </div>
          <div>
            <label className="block">Email</label>
            <Input
              type="email"
              className="p-1"
              value={editing.email}
              onChange={e => {
                setEditing({ ...editing, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              required
              error={errors.email}
            />
          </div>
          <div>
            <label className="block">Cargo/Função</label>
            <Input
              type="text"
              className="p-1"
              value={editing.cargo_funcao}
              onChange={e => setEditing({ ...editing, cargo_funcao: e.target.value })}
            />
          </div>
          <div>
            <label className="block">Time</label>
            <Input
              type="text"
              className="p-1"
              value={editing.time}
              onChange={e => setEditing({ ...editing, time: e.target.value })}
            />
          </div>
          <div>
            <label className="block">Status</label>
            <select
              className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
              value={editing.status}
              onChange={e => setEditing({ ...editing, status: e.target.value })}
            >
              <option>Ativo</option>
              <option>Licenca</option>
              <option>Ferias</option>
              <option>Desligado</option>
            </select>
          </div>
          <div>
            <label className="block">Engajamento</label>
            <Input
              type="number"
              className="p-1"
              value={editing.engajamento || 0}
              onChange={e => setEditing({ ...editing, engajamento: Number(e.target.value) })}
            />
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
