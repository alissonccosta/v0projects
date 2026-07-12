import { StatusBadge } from "@/components/status/status-badge";
import type { SyncStatus } from "@/types/domain";

type SyncIndicatorProps = {
  status: SyncStatus;
  className?: string;
};

/**
 * Indicador de sincronização (SDD, seção 14). Na Fase 1 o único estado real
 * é `not_linked` — a integração com o Notion chega na Fase 7 e passa a
 * alimentar este componente com o estado verdadeiro.
 */
export function SyncIndicator({ status, className }: SyncIndicatorProps) {
  return (
    <StatusBadge
      domain="sincronizacao"
      value={status}
      size="sm"
      className={className}
    />
  );
}
