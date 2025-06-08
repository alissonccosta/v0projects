import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-secondary transition';
  const styles =
    variant === 'secondary'
      ? 'border border-secondary text-secondary bg-white hover:bg-purple-50 disabled:bg-gray-100 disabled:text-gray-400'
      : 'bg-secondary text-white hover:bg-purple-700 disabled:bg-gray-300';
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
