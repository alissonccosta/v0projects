import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export default function Input({ error, className = '', ...props }: InputProps) {
  const base = 'border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-secondary';
  return (
    <div>
      <input className={`${base} ${error ? 'input-error' : ''} ${className}`} {...props} />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}
