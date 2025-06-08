import { diffIndicator } from '../../utils/time';

interface Props {
  estimado: number;
  gasto: number;
}

export default function TimeDiffIndicator({ estimado, gasto }: Props) {
  const level = diffIndicator(estimado, gasto);
  const color =
    level === 'green'
      ? 'bg-status-success'
      : level === 'yellow'
      ? 'bg-status-warning'
      : 'bg-status-error';
  const text = level === 'yellow' ? 'text-black' : 'text-white';
  return <span data-testid="diff-indicator" className={`inline-block w-3 h-3 rounded-full ${color} ${text}`}></span>;
}
