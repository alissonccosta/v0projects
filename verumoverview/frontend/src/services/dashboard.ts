import api from './api';

export async function fetchMetrics() {
  const res = await api.get('/api/dashboard/metrics');
  return res.data;
}

export async function fetchRecentActivities() {
  const res = await api.get('/api/dashboard/activities');
  return res.data;
}

export async function fetchAlerts() {
  const res = await api.get('/api/dashboard/alerts');
  return res.data;
}
