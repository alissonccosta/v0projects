import { useEffect, useState, useContext } from 'react';
import { fetchUsers, createUser, updateUser, deleteUser } from '../services/users';
import { fetchProfiles } from '../services/profiles';
import { logAction } from '../services/logger';
import BackButton from '../components/modules/BackButton';
import { ToastContext } from '../hooks/ToastContext';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, THead, Th } from '../components/ui/Table';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil_id?: number;
  perfil_nome?: string;
  senha?: string;
}

const emptyUser: Usuario = { id: 0, nome: '', email: '', perfil_id: undefined, senha: '' };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [perfis, setPerfis] = useState<any[]>([]);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    Promise.all([loadUsers(), loadPerfis()]).then(() => setLoading(false));
  }, []);

  async function loadUsers() {
    const data = await fetchUsers();
    setUsuarios(data);
  }

  async function loadPerfis() {
    const data = await fetchProfiles();
    setPerfis(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (editing.id) {
      await updateUser(editing.id, editing);
      logAction('update_user', { id: editing.id });
      showToast('Usuário atualizado');
    } else {
      const created = await createUser(editing);
      logAction('create_user', { id: created.id });
      showToast('Usuário criado');
    }
    setEditing(null);
    loadUsers();
  }

  async function handleDelete(id: number) {
    if (!confirm('Excluir usuário?')) return;
    await deleteUser(id);
    logAction('delete_user', { id });
    showToast('Usuário removido');
    loadUsers();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl font-semibold text-secondary mb-4">Usuários</h1>
        </div>
        <Button onClick={() => setEditing({ ...emptyUser })}>Novo Usuário</Button>
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
                <Th>Perfil</Th>
                <Th>Ações</Th>
              </tr>
            </THead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.nome}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.perfil_nome}</td>
                  <td className="p-2 space-x-2">
                    <button className="text-blue-600" onClick={() => setEditing({ ...u })}>Editar</button>
                    <button className="text-red-600" onClick={() => handleDelete(u.id)}>Excluir</button>
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
              onChange={e => setEditing({ ...editing, nome: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block">Email</label>
            <Input
              type="email"
              className="p-1"
              value={editing.email}
              onChange={e => setEditing({ ...editing, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block">Perfil</label>
            <select
              className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
              value={editing.perfil_id || ''}
              onChange={e => setEditing({ ...editing, perfil_id: Number(e.target.value) })}
            >
              <option value="">Selecione</option>
              {perfis.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          {!editing.id && (
            <div>
              <label className="block">Senha</label>
              <Input
                type="password"
                className="p-1"
                value={editing.senha}
                onChange={e => setEditing({ ...editing, senha: e.target.value })}
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="border border-secondary text-secondary px-4 py-1 rounded hover:bg-purple-50">Cancelar</button>
            <Button type="submit" className="py-1">Salvar</Button>
          </div>
        </form>
      )}
    </div>
  );
}
