import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function Card({ title, actions, children }: CardProps) {
  return (
    <div className="bg-white dark:bg-dark-background rounded shadow p-4 space-y-2">
      {(title || actions) && (
        <div className="flex justify-between items-center mb-2">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
