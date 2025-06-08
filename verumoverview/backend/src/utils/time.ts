export function toMinutes(time: string): number {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function fromMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}`;
}

export function diffIndicator(
  estimado: number,
  gasto: number
): 'green' | 'yellow' | 'red' {
  if (estimado === 0) return 'green';
  const ratio = gasto / estimado;
  if (ratio <= 1) return 'green';
  if (ratio <= 1.2) return 'yellow';
  return 'red';
}
