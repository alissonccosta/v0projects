import api from './api';

export async function fetchProfiles() {
  const res = await api.get('/api/perfis');
  return res.data;
}

export async function createProfile(data: any) {
  const res = await api.post('/api/perfis', data);
  return res.data;
}

export async function updateProfile(id: number, data: any) {
  const res = await api.put(`/api/perfis/${id}`, data);
  return res.data;
}

export async function deleteProfile(id: number) {
  await api.delete(`/api/perfis/${id}`);
}
