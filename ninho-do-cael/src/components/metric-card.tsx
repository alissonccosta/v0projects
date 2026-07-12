import type { Icon } from "@phosphor-icons/react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: string;
  value: string;
  unit?: string;
  context?: string;
  icon?: Icon;
  /** Prontidão geral tem a maior hierarquia do dashboard (SDD, seção 14). */
  emphasis?: boolean;
  action?: React.ReactNode;
  className?: string;
};

export function MetricCard({
  title,
  value,
  unit,
  context,
  icon: IconComponent,
  emphasis = false,
  action,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-1 p-5",
        emphasis && "border-sage-300 bg-sage-100/40",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            "text-sm font-medium",
            emphasis ? "text-moss-700" : "text-text-secondary",
          )}
        >
          {title}
        </p>
        {IconComponent ? (
          <IconComponent
            size={20}
            aria-hidden="true"
            className={cn("text-sage-500", emphasis && "text-moss-700")}
          />
        ) : null}
      </div>
      <p
        className={cn(
          "font-display font-semibold text-forest-900",
          emphasis ? "text-4xl" : "text-3xl",
        )}
      >
        {value}
        {unit ? (
          <span
            className={cn(
              "ml-1 font-sans text-base font-medium",
              emphasis ? "text-moss-700" : "text-text-secondary",
            )}
          >
            {unit}
          </span>
        ) : null}
      </p>
      {context ? (
        <p
          className={cn(
            "text-sm",
            emphasis ? "text-moss-700" : "text-text-secondary",
          )}
        >
          {context}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </Card>
  );
}
