/**
 * Diferença campo a campo para o histórico de alterações (SDD, seção 26):
 * registra apenas o que mudou, no formato { campo: { de, para } }.
 */
export function diffChanges(
  before: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, { de: unknown; para: unknown }> {
  const changes: Record<string, { de: unknown; para: unknown }> = {};
  for (const [key, nextValue] of Object.entries(patch)) {
    const previousValue = before[key];
    const normalizedPrevious = previousValue ?? null;
    const normalizedNext = nextValue ?? null;
    if (JSON.stringify(normalizedPrevious) !== JSON.stringify(normalizedNext)) {
      changes[key] = { de: normalizedPrevious, para: normalizedNext };
    }
  }
  return changes;
}
