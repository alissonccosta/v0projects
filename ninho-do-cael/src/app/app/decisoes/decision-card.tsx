import {
  LinkSimpleIcon,
  StethoscopeIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { StatusBadge } from "@/components/status/status-badge";
import { Badge } from "@/components/ui/badge";
import type { DecisionItem } from "@/lib/decisions/view-model";
import { formatDateBR } from "@/lib/formatters/date";
import {
  CONFIDENCE_LABELS,
  DECISION_TYPE_LABELS,
  RESPONSIBLE_LABELS,
} from "@/lib/labels";

/** Card de decisão (seção 21). Médicas carregam o marcador profissional. */
export function DecisionCard({ decision }: { decision: DecisionItem }) {
  const medical = decision.type === "medica";
  return (
    <Link
      href={`/app/decisoes/${decision.id}`}
      className="flex flex-col gap-2 rounded-lg border border-sand/70 bg-card p-4 shadow-[0_1px_2px_rgba(41,53,44,0.05)] transition-colors duration-150 outline-none hover:border-sage-300 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 font-semibold text-forest-900">
          {decision.title}
        </p>
        <StatusBadge domain="decisao" value={decision.status} size="sm" />
      </div>
      {decision.pendingQuestion && decision.status !== "decidida" ? (
        <p className="text-sm text-text-secondary">
          {decision.pendingQuestion}
        </p>
      ) : null}
      {decision.conclusion && decision.status === "decidida" ? (
        <p className="line-clamp-2 text-sm text-text-secondary">
          {decision.conclusion}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
        <Badge tone={medical ? "danger" : "outline"}>
          {medical ? <StethoscopeIcon size={12} aria-hidden="true" /> : null}
          {DECISION_TYPE_LABELS[decision.type]}
        </Badge>
        <span className="inline-flex items-center gap-1">
          <UserIcon size={14} aria-hidden="true" />
          {RESPONSIBLE_LABELS[decision.responsible]}
        </span>
        {decision.dueDate && decision.status !== "decidida" ? (
          <span>até {formatDateBR(decision.dueDate)}</span>
        ) : null}
        {decision.decidedAt ? (
          <span>decidida em {formatDateBR(decision.decidedAt)}</span>
        ) : null}
        {decision.confidence ? (
          <span>{CONFIDENCE_LABELS[decision.confidence]}</span>
        ) : null}
        {decision.needs.length > 0 ? (
          <span className="inline-flex items-center gap-1">
            <LinkSimpleIcon size={14} aria-hidden="true" />
            {decision.needs.length === 1
              ? decision.needs[0]!.title
              : `${decision.needs.length} necessidades`}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
