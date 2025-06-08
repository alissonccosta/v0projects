import api from './api';

export async function logAction(acao: string, detalhes: any = {}) {
  try {
    await api.post('/logs', { acao, detalhes });
  } catch (err) {
    console.error('log error', err);
  }
}
