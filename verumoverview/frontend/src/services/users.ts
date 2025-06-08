import api from './api';

export async function fetchUsers() {
  const res = await api.get('/api/usuarios');
  return res.data;
}

export async function createUser(data: any) {
  const res = await api.post('/api/usuarios', data);
  return res.data;
}

export async function updateUser(id: number, data: any) {
  const res = await api.put(`/api/usuarios/${id}`, data);
  return res.data;
}

export async function deleteUser(id: number) {
  await api.delete(`/api/usuarios/${id}`);
}
