import { InputHTMLAttributes } from 'react';
import { minutesToTime, timeToMinutes } from '../../utils/time';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
}

export default function TimeInput({ value, onChange, className = '', ...props }: Props) {
  const base = 'border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-secondary';
  return (
    <input
      type="time"
      className={`${base} ${className}`}
      value={minutesToTime(value)}
      onChange={e => onChange(timeToMinutes(e.target.value))}
      {...props}
    />
  );
}
