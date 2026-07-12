import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  getStatusVisual,
  type StatusDomain,
  type StatusValue,
} from "./status-config";

type StatusBadgeProps<D extends StatusDomain> = {
  domain: D;
  value: StatusValue<D>;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
};

/**
 * Badge único de status (SDD, seção 14): recebe domínio e valor e resolve
 * rótulo, tom e ícone a partir do mapeamento centralizado.
 */
export function StatusBadge<D extends StatusDomain>({
  domain,
  value,
  size = "md",
  showIcon = true,
  className,
}: StatusBadgeProps<D>) {
  const visual = getStatusVisual(domain, value);
  const IconComponent = visual.icon;
  return (
    <Badge
      tone={visual.tone}
      className={cn(size === "sm" && "px-2 text-[11px]", className)}
    >
      {showIcon ? <IconComponent aria-hidden="true" /> : null}
      {visual.label}
    </Badge>
  );
}
