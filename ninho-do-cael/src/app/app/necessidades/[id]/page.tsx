import {
  ArrowLeftIcon,
  ClockCounterClockwiseIcon,
  PencilSimpleIcon,
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
import { formatBRL } from "@/lib/formatters/currency";
import { formatDateBR } from "@/lib/formatters/date";
import {
  AUDIENCE_LABELS,
  CATEGORY_LABELS,
  NEED_TYPE_LABELS,
  PHASE_LABELS,
  PRIORITY_LABELS,
  RESPONSIBLE_LABELS,
} from "@/lib/labels";
import { buildNeedViewModel } from "@/lib/needs/view-model";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getNeedById,
  listNeedActivity,
} from "@/server/repositories/needs-repository";

import { NeedQuickActions } from "./quick-actions";

export const metadata: Metadata = { title: "Necessidade" };

const ACTIVITY_LABELS: Record<string, string> = {
  criacao: "criou",
  atualizacao: "atualizou",
  arquivamento: "arquivou",
  restauracao: "restaurou",
  conclusao: "concluiu",
  sincronizacao: "sincronizou",
  importacao: "importou",
  exclusao: "excluiu",
};

export default async function NecessidadeDetalhePage({
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
    redirect("/app/necessidades");
  }

  const supabase = await createSupabaseServerClient();
  const row = await getNeedById(supabase, id);
  if (!row) {
    notFound();
  }
  const today = new Date().toISOString().slice(0, 10);
  const need = buildNeedViewModel(row, today);
  const activity = await listNeedActivity(supabase, id);
  const readinessPercent = Math.round(need.readiness * 100);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/app/necessidades"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-text-secondary outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftIcon size={16} aria-hidden="true" />
          Necessidades
        </Link>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-display text-3xl font-semibold text-forest-900">
            {need.title}
          </h1>
          <Link
            href={`/app/necessidades/${need.id}/editar`}
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
          {need.overdue ? <Badge tone="danger">Vencida</Badge> : null}
          {need.archivedAt ? <Badge tone="outline">Arquivada</Badge> : null}
          <StatusBadge
            domain="criticidade"
            value={need.criticality}
            size="sm"
          />
          <StatusBadge domain="prioridade" value={need.priority} size="sm" />
          <StatusBadge
            domain="sincronizacao"
            value={need.syncStatus}
            size="sm"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-baseline justify-between gap-2">
            Situação
            <span className="font-display text-2xl text-moss-700">
              {readinessPercent}%
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div className="flex items-center justify-between gap-2 sm:block">
              <dt className="text-text-secondary">Decisão</dt>
              <dd className="sm:mt-1">
                <StatusBadge
                  domain="decisaoNecessidade"
                  value={need.decisionStatus}
                  size="sm"
                />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2 sm:block">
              <dt className="text-text-secondary">Aquisição</dt>
              <dd className="sm:mt-1">
                <StatusBadge
                  domain="aquisicao"
                  value={need.acquisitionStatus}
                  size="sm"
                />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2 sm:block">
              <dt className="text-text-secondary">Logística</dt>
              <dd className="sm:mt-1">
                <StatusBadge
                  domain="logistica"
                  value={need.logisticsStatus}
                  size="sm"
                />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2 sm:block">
              <dt className="text-text-secondary">Prontidão</dt>
              <dd className="sm:mt-1">
                <StatusBadge
                  domain="prontidao"
                  value={need.readinessStatus}
                  size="sm"
                />
              </dd>
            </div>
          </dl>
          <Separator />
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-text-secondary">Categoria</dt>
              <dd className="font-medium text-forest-900">
                {CATEGORY_LABELS[need.category]}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">Fase</dt>
              <dd className="font-medium text-forest-900">
                {PHASE_LABELS[need.phase]}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">Responsável</dt>
              <dd className="font-medium text-forest-900">
                {RESPONSIBLE_LABELS[need.responsible]}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">Tipo</dt>
              <dd className="font-medium text-forest-900">
                {NEED_TYPE_LABELS[need.type]} · {AUDIENCE_LABELS[need.audience]}
              </dd>
            </div>
            <div>
              <dt className="text-text-secondary">Prioridade</dt>
              <dd className="font-medium text-forest-900">
                {PRIORITY_LABELS[need.priority]}
              </dd>
            </div>
            {need.requiredQuantity ? (
              <div>
                <dt className="text-text-secondary">Quantidade</dt>
                <dd className="font-medium text-forest-900">
                  {need.availableQuantity ?? 0}/{need.requiredQuantity}
                  {need.unit ? ` ${need.unit}` : ""}
                </dd>
              </div>
            ) : null}
            {need.estimatedPrice !== null ? (
              <div>
                <dt className="text-text-secondary">Preço estimado</dt>
                <dd className="font-medium text-forest-900">
                  {formatBRL(need.estimatedPrice)}
                </dd>
              </div>
            ) : null}
            {need.paidPrice !== null ? (
              <div>
                <dt className="text-text-secondary">Preço pago</dt>
                <dd className="font-medium text-forest-900">
                  {formatBRL(need.paidPrice)}
                </dd>
              </div>
            ) : null}
            {need.dueDate ? (
              <div>
                <dt className="text-text-secondary">Prazo</dt>
                <dd
                  className={
                    need.overdue
                      ? "font-semibold text-danger-strong"
                      : "font-medium text-forest-900"
                  }
                >
                  {formatDateBR(need.dueDate)}
                </dd>
              </div>
            ) : null}
          </dl>
          {need.auditNotes ? (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-text-secondary">Observações</p>
                <p className="mt-1 leading-relaxed whitespace-pre-wrap text-forest-900">
                  {need.auditNotes}
                </p>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <NeedQuickActions
        needId={need.id}
        acquisitionStatus={need.acquisitionStatus}
        logisticsStatus={need.logisticsStatus}
        readinessStatus={need.readinessStatus}
        requiredQuantity={need.requiredQuantity}
        availableQuantity={need.availableQuantity}
        archived={need.archivedAt !== null}
      />

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
