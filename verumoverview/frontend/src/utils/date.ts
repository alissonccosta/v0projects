type DateOptions = Intl.DateTimeFormatOptions & {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
};

export function formatDate(
  date: string | number | Date,
  options: DateOptions = { dateStyle: 'short' }
) {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    date = new Date(`${date}T00:00:00-03:00`);
  }
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    ...options
  }).format(new Date(date));
  return formatted.replace(',', '');
}

export function formatDateTime(date: string | number | Date) {
  return formatDate(date, { dateStyle: 'short', timeStyle: 'short' });
}
