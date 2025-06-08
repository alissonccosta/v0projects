import { useEffect, useState } from 'react';
import {
  fetchPeople,
  createPerson,
  updatePerson,
  deletePerson
} from '../services/people';
import { logAction } from '../services/logger';

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
      <div className="flex justify-between">
        <h1 className="text-xl font-bold">Pessoas</h1>
        <button
          className="bg-secondary text-white px-4 py-2 rounded"
          onClick={() => setEditing({ ...emptyPerson })}
        >
          Nova Pessoa
        </button>
      </div>

      <div>
        <label className="mr-2">Status:</label>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border p-1">
          <option value="">Todos</option>
          <option>Ativo</option>
          <option>Licenca</option>
          <option>Ferias</option>
          <option>Desligado</option>
        </select>
      </div>

      <table className="min-w-full bg-white dark:bg-dark-background text-sm">
        <thead>
          <tr>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Cargo</th>
            <th className="p-2 text-left">Time</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Engajamento</th>
            <th className="p-2 text-left">Ações</th>
          </tr>
        </thead>
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
                <button className="text-blue-600" onClick={() => setEditing({ ...p })}>Editar</button>
                <button className="text-red-600" onClick={() => handleDelete(p.id_pessoa)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-background p-4 rounded shadow space-y-2">
          <div>
            <label className="block">Nome Completo</label>
            <input
              type="text"
              className="border p-1 w-full"
              value={editing.nome_completo}
              onChange={e => setEditing({ ...editing, nome_completo: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block">Email</label>
            <input
              type="email"
              className="border p-1 w-full"
              value={editing.email}
              onChange={e => setEditing({ ...editing, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block">Cargo/Função</label>
            <input
              type="text"
              className="border p-1 w-full"
              value={editing.cargo_funcao}
              onChange={e => setEditing({ ...editing, cargo_funcao: e.target.value })}
            />
          </div>
          <div>
            <label className="block">Time</label>
            <input
              type="text"
              className="border p-1 w-full"
              value={editing.time}
              onChange={e => setEditing({ ...editing, time: e.target.value })}
            />
          </div>
          <div>
            <label className="block">Status</label>
            <select
              className="border p-1 w-full"
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
              className="border p-1 w-full"
              value={editing.engajamento || 0}
              onChange={e => setEditing({ ...editing, engajamento: Number(e.target.value) })}
            />
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
