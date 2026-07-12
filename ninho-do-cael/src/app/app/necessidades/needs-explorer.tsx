"use client";

import {
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import * as React from "react";

import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status/status-badge";
import { getStatusVisual } from "@/components/status/status-config";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatDateBR } from "@/lib/formatters/date";
import {
  CATEGORY_LABELS,
  PHASE_LABELS,
  RESPONSIBLE_LABELS,
} from "@/lib/labels";
import {
  DEFAULT_FILTERS,
  NEED_VIEWS,
  compareNeeds,
  countActiveFilters,
  needMatchesFilters,
  serializeNeedFilters,
  type NeedFilters,
  type NeedView,
} from "@/lib/needs/filters";
import {
  viewModelToFilterable,
  type NeedViewModel,
} from "@/lib/needs/view-model";
import {
  ACQUISITION_STATUSES,
  CATEGORIES,
  CRITICALITIES,
  LOGISTICS_STATUSES,
  READINESS_STATUSES,
  RESPONSIBLE_PARTIES,
  USAGE_PHASES,
} from "@/types/domain";
import { cn } from "@/lib/utils";

const VIEW_LABELS: Record<NeedView, string> = {
  lista: "Lista",
  categoria: "Por categoria",
  fase: "Por fase",
  prontidao: "Por prontidão",
  responsavel: "Por responsável",
};

export function NeedsExplorer({
  needs,
  initialFilters,
}: {
  needs: NeedViewModel[];
  initialFilters: NeedFilters;
}) {
  const [filters, setFilters] = React.useState<NeedFilters>(initialFilters);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  function applyFilters(next: NeedFilters) {
    setFilters(next);
    const query = serializeNeedFilters(next);
    // Atualização rasa: preserva o estado na URL sem novo fetch (seção 16).
    window.history.replaceState(
      null,
      "",
      query ? `?${query}` : window.location.pathname,
    );
  }

  const update = (patch: Partial<NeedFilters>) =>
    applyFilters({ ...filters, ...patch });

  const filtered = React.useMemo(() => {
    return needs
      .filter((need) =>
        needMatchesFilters(viewModelToFilterable(need), filters),
      )
      .sort((a, b) =>
        compareNeeds(viewModelToFilterable(a), viewModelToFilterable(b)),
      );
  }, [needs, filters]);

  const groups = React.useMemo(
    () => groupNeeds(filtered, filters.visao),
    [filtered, filters.visao],
  );

  const activeCount = countActiveFilters(filters);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-56">
          <MagnifyingGlassIcon
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-secondary"
          />
          <Input
            type="search"
            inputMode="search"
            aria-label="Buscar necessidades"
            placeholder="Buscar (ignora acentos)…"
            className="pl-9"
            value={filters.q ?? ""}
            onChange={(event) => update({ q: event.target.value || undefined })}
          />
        </div>
        <Label htmlFor="visao" className="sr-only">
          Visualização
        </Label>
        <Select
          id="visao"
          className="w-44 max-sm:flex-1"
          value={filters.visao}
          onChange={(event) =>
            update({ visao: event.target.value as NeedView })
          }
        >
          {NEED_VIEWS.map((view) => (
            <option key={view} value={view}>
              {VIEW_LABELS[view]}
            </option>
          ))}
        </Select>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            className={buttonVariants({
              variant: "outline",
              className: "gap-1.5 lg:hidden",
            })}
          >
            <FunnelSimpleIcon size={18} aria-hidden="true" />
            Filtrar
            {activeCount > 0 ? <Badge tone="sage">{activeCount}</Badge> : null}
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Filtrar necessidades</SheetTitle>
              <SheetDescription>
                Os filtros se combinam entre si.
              </SheetDescription>
            </SheetHeader>
            <FilterFields filters={filters} onChange={update} />
            <Button onClick={() => setSheetOpen(false)}>
              Ver {filtered.length}{" "}
              {filtered.length === 1 ? "resultado" : "resultados"}
            </Button>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filtros inline no desktop (seção 13.3) */}
      <div className="hidden lg:block">
        <FilterFields filters={filters} onChange={update} compact />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <QuickToggle
          label="Antes do parto"
          active={filters.antesDoParto}
          onClick={() => update({ antesDoParto: !filters.antesDoParto })}
        />
        <QuickToggle
          label="Somente pendências"
          active={filters.somentePendencias}
          onClick={() =>
            update({ somentePendencias: !filters.somentePendencias })
          }
        />
        <QuickToggle
          label="Somente críticas"
          active={filters.somenteCriticas}
          onClick={() => update({ somenteCriticas: !filters.somenteCriticas })}
        />
        <QuickToggle
          label="Arquivadas"
          active={filters.arquivadas}
          onClick={() => update({ arquivadas: !filters.arquivadas })}
        />
        <span
          aria-live="polite"
          className="ml-auto text-sm text-text-secondary"
        >
          {filtered.length} de {needs.length}
        </span>
        {activeCount > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyFilters({ ...DEFAULT_FILTERS })}
          >
            Limpar filtros
          </Button>
        ) : null}
      </div>

      {needs.length === 0 ? (
        <EmptyState
          title="Nenhuma necessidade ainda"
          description="Crie a primeira necessidade do enxoval. A importação do Notion chega na Fase 7."
          action={
            <Link href="/app/necessidades/nova" className={buttonVariants()}>
              Criar necessidade
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nada com esses filtros"
          description="Nenhuma necessidade corresponde à combinação atual."
          action={
            <Button
              variant="outline"
              onClick={() => applyFilters({ ...DEFAULT_FILTERS })}
            >
              Mostrar todas
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.key} className="flex flex-col gap-2">
              {group.label ? (
                <h2 className="flex items-baseline gap-2 text-sm font-semibold text-moss-700">
                  {group.label}
                  <span className="font-normal text-text-secondary">
                    {group.needs.length}
                  </span>
                </h2>
              ) : null}
              <ul className="flex flex-col gap-2">
                {group.needs.map((need) => (
                  <NeedCard key={need.id} need={need} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 cursor-pointer items-center rounded-full border px-3 text-sm font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-moss-700 bg-moss-700 text-surface"
          : "border-sand bg-surface text-text-secondary hover:bg-secondary/50",
      )}
    >
      {label}
    </button>
  );
}

function FilterFields({
  filters,
  onChange,
  compact = false,
}: {
  filters: NeedFilters;
  onChange: (patch: Partial<NeedFilters>) => void;
  compact?: boolean;
}) {
  const fields: Array<{
    key:
      | "categoria"
      | "fase"
      | "criticidade"
      | "responsavel"
      | "aquisicao"
      | "logistica"
      | "prontidao";
    label: string;
    options: ReadonlyArray<string>;
    optionLabel: (value: string) => string;
  }> = [
    {
      key: "categoria",
      label: "Categoria",
      options: CATEGORIES,
      optionLabel: (v) => CATEGORY_LABELS[v as keyof typeof CATEGORY_LABELS],
    },
    {
      key: "fase",
      label: "Fase",
      options: USAGE_PHASES,
      optionLabel: (v) => PHASE_LABELS[v as keyof typeof PHASE_LABELS],
    },
    {
      key: "criticidade",
      label: "Criticidade",
      options: CRITICALITIES,
      optionLabel: (v) => getStatusVisual("criticidade", v as never).label,
    },
    {
      key: "responsavel",
      label: "Responsável",
      options: RESPONSIBLE_PARTIES,
      optionLabel: (v) =>
        RESPONSIBLE_LABELS[v as keyof typeof RESPONSIBLE_LABELS],
    },
    {
      key: "aquisicao",
      label: "Aquisição",
      options: ACQUISITION_STATUSES,
      optionLabel: (v) => getStatusVisual("aquisicao", v as never).label,
    },
    {
      key: "logistica",
      label: "Logística",
      options: LOGISTICS_STATUSES,
      optionLabel: (v) => getStatusVisual("logistica", v as never).label,
    },
    {
      key: "prontidao",
      label: "Prontidão",
      options: READINESS_STATUSES,
      optionLabel: (v) => getStatusVisual("prontidao", v as never).label,
    },
  ];

  return (
    <div
      className={cn(
        "grid gap-3",
        compact
          ? "grid-cols-2 xl:grid-cols-7 lg:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-2",
      )}
    >
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1">
          <Label htmlFor={`filtro-${field.key}`} className="text-xs">
            {field.label}
          </Label>
          <Select
            id={`filtro-${field.key}`}
            value={filters[field.key] ?? ""}
            onChange={(event) =>
              onChange({
                [field.key]: event.target.value || undefined,
              } as Partial<NeedFilters>)
            }
          >
            <option value="">Todas</option>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {field.optionLabel(option)}
              </option>
            ))}
          </Select>
        </div>
      ))}
    </div>
  );
}

type Group = { key: string; label: string | null; needs: NeedViewModel[] };

function groupNeeds(needs: NeedViewModel[], view: NeedView): Group[] {
  if (view === "lista") {
    return [{ key: "todas", label: null, needs }];
  }
  const keyOf = (need: NeedViewModel): string => {
    switch (view) {
      case "categoria":
        return need.category;
      case "fase":
        return need.phase;
      case "prontidao":
        return need.readinessStatus;
      case "responsavel":
        return need.responsible;
      default:
        return "todas";
    }
  };
  const labelOf = (key: string): string => {
    switch (view) {
      case "categoria":
        return CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS];
      case "fase":
        return PHASE_LABELS[key as keyof typeof PHASE_LABELS];
      case "prontidao":
        return getStatusVisual("prontidao", key as never).label;
      case "responsavel":
        return RESPONSIBLE_LABELS[key as keyof typeof RESPONSIBLE_LABELS];
      default:
        return key;
    }
  };
  const order: ReadonlyArray<string> =
    view === "categoria"
      ? CATEGORIES
      : view === "fase"
        ? USAGE_PHASES
        : view === "prontidao"
          ? READINESS_STATUSES
          : RESPONSIBLE_PARTIES;

  const map = new Map<string, NeedViewModel[]>();
  for (const need of needs) {
    const key = keyOf(need);
    map.set(key, [...(map.get(key) ?? []), need]);
  }
  return order
    .filter((key) => map.has(key))
    .map((key) => ({ key, label: labelOf(key), needs: map.get(key)! }));
}

function NeedCard({ need }: { need: NeedViewModel }) {
  const readinessPercent = Math.round(need.readiness * 100);
  return (
    <li>
      <Link
        href={`/app/necessidades/${need.id}`}
        className="flex flex-col gap-2 rounded-lg border border-sand/70 bg-card p-4 shadow-[0_1px_2px_rgba(41,53,44,0.05)] transition-colors duration-150 outline-none hover:border-sage-300 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 font-semibold text-forest-900">{need.title}</p>
          <span
            className="shrink-0 font-display text-sm font-semibold text-moss-700"
            aria-label={`Prontidão ${readinessPercent}%`}
          >
            {readinessPercent}%
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {need.overdue ? (
            <Badge tone="danger">
              <WarningCircleIcon aria-hidden="true" />
              Vencida
            </Badge>
          ) : null}
          <StatusBadge
            domain="criticidade"
            value={need.criticality}
            size="sm"
          />
          <StatusBadge
            domain="aquisicao"
            value={need.acquisitionStatus}
            size="sm"
          />
          <StatusBadge
            domain="prontidao"
            value={need.readinessStatus}
            size="sm"
          />
          {need.archivedAt ? <Badge tone="outline">Arquivada</Badge> : null}
        </div>
        <p className="text-sm text-text-secondary">
          {CATEGORY_LABELS[need.category]} · {PHASE_LABELS[need.phase]} ·{" "}
          {RESPONSIBLE_LABELS[need.responsible]}
          {need.requiredQuantity
            ? ` · ${need.availableQuantity ?? 0}/${need.requiredQuantity}${need.unit ? ` ${need.unit}` : ""}`
            : ""}
          {need.dueDate ? (
            <>
              {" · "}
              <span
                className={cn(
                  need.overdue && "font-semibold text-danger-strong",
                )}
              >
                até {formatDateBR(need.dueDate)}
              </span>
            </>
          ) : null}
        </p>
      </Link>
    </li>
  );
}
