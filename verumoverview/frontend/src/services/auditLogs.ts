import api from './api';

export async function fetchLogs(params: any = {}) {
  const res = await api.get('/api/audit-logs', { params });
  return res.data;
}
