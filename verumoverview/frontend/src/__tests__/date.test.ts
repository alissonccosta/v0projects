import { formatDate, formatDateTime } from '../utils/date';

test('formata apenas a data corretamente', () => {
  expect(formatDate('2023-01-15')).toBe('15/01/2023');
});

test('formata data e hora em São Paulo', () => {
  const res = formatDateTime('2023-01-01T12:00:00Z');
  expect(res).toBe('01/01/2023 09:00');
});
