import api from './api';

export async function fetchActivities() {
  const res = await api.get('/api/atividades');
  return res.data;
}

export async function createActivity(data: any) {
  const res = await api.post('/api/atividades', data);
  return res.data;
}

export async function updateActivity(id: string, data: any) {
  const res = await api.put(`/api/atividades/${id}`, data);
  return res.data;
}

export async function deleteActivity(id: string) {
  await api.delete(`/api/atividades/${id}`);
}
