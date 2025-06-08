import { ReactNode, HTMLAttributes } from 'react';

export interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  if (!title && !subtitle && !action) return null;

  return (
    <div className="flex justify-between items-start mb-2">
      <div>
        {title && (
          <h3 className="text-lg font-semibold text-primary dark:text-white">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-medium dark:text-gray-light">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="ml-2">{action}</div>}
    </div>
  );
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div className="py-2">{children}</div>;
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <div className="pt-2 mt-2 border-t dark:border-dark-background">{children}</div>;
}

type Variant = 'default' | 'highlighted' | 'success' | 'warning' | 'error';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  variant?: Variant;
}

export default function Card({
  title,
  subtitle,
  children,
  className = '',
  headerAction,
  variant = 'default',
  ...props
}: CardProps) {
  const variantClasses: Record<Variant, string> = {
    default: '',
    highlighted: 'border border-primary dark:border-primary',
    success: 'border border-status-success dark:border-status-success',
    warning: 'border border-status-warning dark:border-status-warning',
    error: 'border border-status-error dark:border-status-error'
  };

  const clickable = props.onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`bg-white dark:bg-dark-card rounded-[10px] shadow transition-shadow duration-200 hover:shadow-md ${variantClasses[variant]} ${clickable} ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <CardHeader title={title} subtitle={subtitle} action={headerAction} />
      )}
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

