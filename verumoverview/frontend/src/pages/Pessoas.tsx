import { useEffect, useState } from 'react';
import {
  fetchPeople,
  createPerson,
  updatePerson,
  deletePerson
} from '../services/people';
import { logAction } from '../services/logger';
import BackButton from '../components/BackButton';
import { Table, THead, Th, Td } from '../components/ui/Table';

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

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await fetchPeople();
    setPeople(data);
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
    } else {
      const created = await createPerson(editing);
      logAction('create_person', { id: created.id_pessoa });
    }
    setEditing(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir pessoa?')) return;
    await deletePerson(id);
    logAction('delete_person', { id });
    load();
  }

  const filtered = filter ? people.filter(p => p.status === filter) : people;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-xl font-bold">Pessoas</h1>
        </div>
        <button
          className="bg-secondary text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={() => setEditing({ ...emptyPerson })}
        >
          Nova Pessoa
        </button>
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
                <td className="p-2">{p.status}</td>
                <td className="p-2">{p.engajamento}</td>
                <td className="p-2 space-x-2">
                  <button aria-label="Editar" className="text-blue-600" onClick={() => setEditing({ ...p })}>Editar</button>
                  <button aria-label="Excluir" className="text-red-600" onClick={() => handleDelete(p.id_pessoa)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {editing && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-background p-4 rounded shadow space-y-2">
          <div>
            <label className="block">Nome Completo</label>
            <input
              type="text"
              className={`border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary ${errors.nome_completo ? 'input-error' : ''}`}
              value={editing.nome_completo}
              onChange={e => {
                setEditing({ ...editing, nome_completo: e.target.value });
                if (errors.nome_completo) setErrors({ ...errors, nome_completo: '' });
              }}
              required
            />
            {errors.nome_completo && <span className="error-message">{errors.nome_completo}</span>}
          </div>
          <div>
            <label className="block">Email</label>
            <input
              type="email"
              className={`border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary ${errors.email ? 'input-error' : ''}`}
              value={editing.email}
              onChange={e => {
                setEditing({ ...editing, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              required
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          <div>
            <label className="block">Cargo/Função</label>
            <input
              type="text"
              className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
              value={editing.cargo_funcao}
              onChange={e => setEditing({ ...editing, cargo_funcao: e.target.value })}
            />
          </div>
          <div>
            <label className="block">Time</label>
            <input
              type="text"
              className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
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
            <input
              type="number"
              className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
              value={editing.engajamento || 0}
              onChange={e => setEditing({ ...editing, engajamento: Number(e.target.value) })}
            />
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
