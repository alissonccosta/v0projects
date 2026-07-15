import {
  ArrowLeftIcon,
  ClockCounterClockwiseIcon,
  LinkSimpleIcon,
  PencilSimpleIcon,
  StethoscopeIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { StatusBadge } from "@/components/status/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSessionInfo } from "@/lib/auth/session";
import {
  MEDICAL_DECISION_NOTICE,
  isMedicalDecision,
} from "@/lib/decisions/model";
import { buildDecisionItem } from "@/lib/decisions/view-model";
import { formatDateBR } from "@/lib/formatters/date";
import {
  CONFIDENCE_LABELS,
  DECISION_TYPE_LABELS,
  RESPONSIBLE_LABELS,
} from "@/lib/labels";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listEntityActivity } from "@/server/repositories/activity-repository";
import { getDecisionById } from "@/server/repositories/decisions-repository";

import { DecideDialog } from "./decision-actions";

export const metadata: Metadata = { title: "Decisão" };

const ACTIVITY_LABELS: Record<string, string> = {
  criacao: "criou",
  atualizacao: "atualizou",
  conclusao: "registrou a conclusão de",
  sincronizacao: "sincronizou",
  importacao: "importou",
};

export default async function DecisaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    notFound();
  }

  const session = await getSessionInfo();
  if (session.mode !== "member") {
    redirect("/app/decisoes");
  }

  const supabase = await createSupabaseServerClient();
  const row = await getDecisionById(supabase, id);
  if (!row) {
    notFound();
  }
  const decision = buildDecisionItem(row);
  const medical = isMedicalDecision(decision.type);
  const activity = await listEntityActivity(supabase, "decision", id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/app/decisoes"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-text-secondary outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftIcon size={16} aria-hidden="true" />
          Decisões
        </Link>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-display text-3xl font-semibold text-forest-900">
            {decision.title}
          </h1>
          <Link
            href={`/app/decisoes/${decision.id}/editar`}
            className={buttonVariants({
              variant: "outline",
              className: "gap-1.5",
            })}
          >
            <PencilSimpleIcon size={18} aria-hidden="true" />
            Editar
          </Link>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <StatusBadge domain="decisao" value={decision.status} size="sm" />
          <Badge tone={medical ? "danger" : "outline"}>
            {medical ? <StethoscopeIcon size={12} aria-hidden="true" /> : null}
            {DECISION_TYPE_LABELS[decision.type]}
          </Badge>
        </div>
      </div>

      {medical ? (
        <p className="flex items-start gap-2.5 rounded-md bg-info-soft p-3 text-sm leading-relaxed text-forest-900">
          <StethoscopeIcon
            size={18}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-moss-700"
          />
          {MEDICAL_DECISION_NOTICE}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Contexto</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {decision.pendingQuestion ? (
            <div className="text-sm">
              <p className="text-text-secondary">Pergunta em aberto</p>
              <p className="mt-1 leading-relaxed whitespace-pre-wrap text-forest-900">
                {decision.pendingQuestion}
              </p>
            </div>
          ) : null}
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-text-secondary">Responsável</dt>
              <dd className="font-medium text-forest-900">
                {RESPONSIBLE_LABELS[decision.responsible]}
              </dd>
            </div>
            {decision.dueDate ? (
              <div>
                <dt className="text-text-secondary">Prazo</dt>
                <dd className="font-medium text-forest-900">
                  {formatDateBR(decision.dueDate)}
                </dd>
              </div>
            ) : null}
            {decision.confidence ? (
              <div>
                <dt className="text-text-secondary">Confiança</dt>
                <dd className="font-medium text-forest-900">
                  {CONFIDENCE_LABELS[decision.confidence]}
                </dd>
              </div>
            ) : null}
            {decision.impact ? (
              <div>
                <dt className="text-text-secondary">Impacto</dt>
                <dd className="font-medium text-forest-900">
                  {decision.impact}
                </dd>
              </div>
            ) : null}
            {decision.source ? (
              <div>
                <dt className="text-text-secondary">Fonte</dt>
                <dd className="font-medium text-forest-900">
                  {decision.source}
                </dd>
              </div>
            ) : null}
            {decision.decidedAt ? (
              <div>
                <dt className="text-text-secondary">Decidida em</dt>
                <dd className="font-medium text-forest-900">
                  {formatDateBR(decision.decidedAt)}
                </dd>
              </div>
            ) : null}
          </dl>

          {decision.conclusion ? (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-text-secondary">Conclusão</p>
                <p className="mt-1 leading-relaxed whitespace-pre-wrap text-forest-900">
                  {decision.conclusion}
                </p>
              </div>
            </>
          ) : null}

          {decision.rationale ? (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-text-secondary">Justificativa</p>
                <p className="mt-1 leading-relaxed whitespace-pre-wrap text-forest-900">
                  {decision.rationale}
                </p>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      {decision.status !== "decidida" ? (
        <div className="flex flex-wrap gap-2">
          <DecideDialog decisionId={decision.id} medical={medical} />
        </div>
      ) : null}

      {decision.needs.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkSimpleIcon
                size={20}
                aria-hidden="true"
                className="text-moss-700"
              />
              Necessidades vinculadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-1">
              {decision.needs.map((need) => (
                <li key={need.id}>
                  <Link
                    href={`/app/necessidades/${need.id}`}
                    className="inline-flex min-h-11 items-center text-sm font-medium text-forest-900 underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {need.title}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockCounterClockwiseIcon
              size={20}
              aria-hidden="true"
              className="text-moss-700"
            />
            Histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-sm text-text-secondary">
              Nenhuma alteração registrada ainda.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {activity.map((entry) => (
                <li key={entry.id} className="text-sm">
                  <p className="text-forest-900">
                    <span className="font-semibold">
                      {entry.actor?.display_name ?? "Sistema"}
                    </span>{" "}
                    {ACTIVITY_LABELS[entry.action] ?? entry.action}
                    {entry.origin !== "app" ? ` (via ${entry.origin})` : ""}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {new Date(entry.created_at).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                    {entry.changes && entry.action === "atualizacao"
                      ? ` · ${Object.keys(entry.changes).length} campo(s)`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
