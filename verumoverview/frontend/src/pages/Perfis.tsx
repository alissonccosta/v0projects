import { useEffect, useState, useContext } from 'react';
import { fetchProfiles, createProfile, updateProfile, deleteProfile } from '../services/profiles';
import { logAction } from '../services/logger';
import BackButton from '../components/modules/BackButton';
import { ToastContext } from '../hooks/ToastContext';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Table, THead, Th } from '../components/ui/Table';

interface Perfil {
  id: number;
  nome: string;
  permissoes: any;
}

const emptyPerfil: Perfil = { id: 0, nome: '', permissoes: {} };

export default function Perfis() {
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [editing, setEditing] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await fetchProfiles();
    setPerfis(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (editing.id) {
      await updateProfile(editing.id, editing);
      logAction('update_profile', { id: editing.id });
      showToast('Perfil atualizado');
    } else {
      const created = await createProfile(editing);
      logAction('create_profile', { id: created.id });
      showToast('Perfil criado');
    }
    setEditing(null);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm('Excluir perfil?')) return;
    await deleteProfile(id);
    logAction('delete_profile', { id });
    showToast('Perfil removido');
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl font-semibold text-secondary mb-4">Perfis de Acesso</h1>
        </div>
        <Button onClick={() => setEditing({ ...emptyPerfil })}>Novo Perfil</Button>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <Skeleton className="h-60 w-full" />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>Nome</Th>
                <Th>Permissões</Th>
                <Th>Ações</Th>
              </tr>
            </THead>
            <tbody>
              {perfis.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.nome}</td>
                  <td className="p-2">{Object.keys(p.permissoes || {}).join(', ')}</td>
                  <td className="p-2 space-x-2">
                    <button className="text-blue-600" onClick={() => setEditing({ ...p })}>Editar</button>
                    <button className="text-red-600" onClick={() => handleDelete(p.id)}>Excluir</button>
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
            <Input type="text" className="p-1" value={editing.nome} onChange={e => setEditing({ ...editing, nome: e.target.value })} required />
          </div>
          <div>
            <label className="block">Permissões (JSON)</label>
            <textarea
              className="border p-1 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
              rows={4}
              value={JSON.stringify(editing.permissoes)}
              onChange={e => setEditing({ ...editing, permissoes: JSON.parse(e.target.value || '{}') })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="border border-secondary text-secondary px-4 py-1 rounded hover:bg-purple-50">Cancelar</button>
            <Button type="submit" className="py-1">Salvar</Button>
          </div>
        </form>
      )}
    </div>
  );
}
