import type { Icon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: Icon;
  title: string;
  description: string;
  /** Ação útil e funcional (SDD, seção 14). Nunca um botão decorativo. */
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon: IconComponent,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-sand bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      {IconComponent ? (
        <span className="flex size-12 items-center justify-center rounded-full bg-sage-100 text-moss-700">
          <IconComponent size={24} aria-hidden="true" />
        </span>
      ) : null}
      <h2 className="text-lg font-semibold text-forest-900">{title}</h2>
      <p className="max-w-md text-sm leading-relaxed text-text-secondary">
        {description}
      </p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
