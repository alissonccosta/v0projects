import api from './api';

export async function solicitarAcesso(email: string) {
  const res = await api.post('/auth/solicitar', { email });
  return res.data;
}

export async function fetchSolicitacoes() {
  const res = await api.get('/auth/solicitacoes');
  return res.data;
}

export async function atualizarSolicitacao(id: number, status: string) {
  const res = await api.put(`/auth/solicitacoes/${id}`, { status });
  return res.data;
}
