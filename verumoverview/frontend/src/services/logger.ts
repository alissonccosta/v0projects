export async function logAction(acao: string, detalhes: any = {}) {
  try {
    const { default: api } = await import('./api');
    await api.post('/logs', { acao, detalhes });
  } catch (err) {
    console.error('log error', err);
  }
}
