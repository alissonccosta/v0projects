import api from './api';

export async function fetchPeople() {
  const res = await api.get('/api/pessoas');
  return res.data;
}

export async function createPerson(data: any) {
  const res = await api.post('/api/pessoas', data);
  return res.data;
}

export async function updatePerson(id: string, data: any) {
  const res = await api.put(`/api/pessoas/${id}`, data);
  return res.data;
}

export async function deletePerson(id: string) {
  await api.delete(`/api/pessoas/${id}`);
}
