import React from 'react';

const statusStyles = {
  success: 'bg-[#00B894] text-white hover:bg-[#00a884]',
  warning: 'bg-[#FDCB6E] text-white hover:bg-[#e2b95f]',
  error: 'bg-[#D63031] text-white hover:bg-[#c12b2b]',
  default: 'bg-[#4E008E] text-white hover:bg-[#3a0066]'
};

const priorityStyles = {
  high: 'bg-white dark:bg-dark-card text-[#E17055] border-[#E17055] hover:bg-[#fff5f3] dark:hover:bg-[#3b2a2a]',
  medium: 'bg-white dark:bg-dark-card text-[#FDCB6E] border-[#FDCB6E] hover:bg-[#fff9e5] dark:hover:bg-[#3b372a]',
  low: 'bg-white dark:bg-dark-card text-[#0984E3] border-[#0984E3] hover:bg-[#e6f1fd] dark:hover:bg-[#273443]'
};

const sizeStyles = {
  small: 'px-2 py-1 text-xs',
  medium: 'px-3 py-1.5 text-sm',
  large: 'px-4 py-2 text-base'
};

export default function Badge({
  variant = 'default',
  size = 'medium',
  children,
  icon,
  className = ''
}) {
  const base = 'inline-flex items-center gap-1 rounded border transition-colors duration-200';
  const variantClass = statusStyles[variant] || priorityStyles[variant] || statusStyles.default;
  const sizeClass = sizeStyles[size] || sizeStyles.medium;

  return (
    <span className={`${base} ${variantClass} ${sizeClass} ${className}`.trim()}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
}
