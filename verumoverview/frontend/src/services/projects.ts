import api from './api';

export async function fetchProjects() {
  const res = await api.get('/api/projects');
  return res.data;
}

export async function createProject(data: any) {
  const res = await api.post('/api/projects', data);
  return res.data;
}

export async function updateProject(id: string, data: any) {
  const res = await api.put(`/api/projects/${id}`, data);
  return res.data;
}

export async function deleteProject(id: string) {
  await api.delete(`/api/projects/${id}`);
}

export async function getNextProjectCode() {
  const res = await api.get('/api/projects/next-code');
  return res.data.code as string;
}

export async function fetchProjectActivities(id: string) {
  const res = await api.get(`/api/projects/${id}/atividades`);
  return res.data;
}
