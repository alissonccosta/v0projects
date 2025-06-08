import api from './api';

export async function fetchTimes() {
  const res = await api.get('/api/times');
  return res.data;
}

export async function createTime(data: any) {
  const res = await api.post('/api/times', data);
  return res.data;
}

export async function updateTime(id: string, data: any) {
  const res = await api.put(`/api/times/${id}`, data);
  return res.data;
}

export async function deleteTime(id: string) {
  await api.delete(`/api/times/${id}`);
}
