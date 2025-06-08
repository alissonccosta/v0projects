import { HTMLAttributes } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface Props extends Omit<HTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function InputDate({ value, onChange, className = '', ...props }: Props) {
  const base = 'border p-2 rounded w-40 focus:outline-none focus:ring-2 focus:ring-secondary';
  const selected = value ? new Date(value) : null;

  return (
    <div className="relative inline-block">
      <DatePicker
        selected={selected}
        onChange={date => onChange(date ? date.toISOString().slice(0, 10) : '')}
        className={`${base} ${className}`}
        dateFormat="yyyy-MM-dd"
        {...props}
      />
      <CalendarIcon className="w-4 h-4 absolute right-2 top-2 pointer-events-none text-gray-500" />
    </div>
  );
}
