import { z } from "zod";

import {
  productNeedReadiness,
  type ProductNeedInput,
} from "@/lib/calculations/readiness";
import {
  ACQUISITION_STATUSES,
  CATEGORIES,
  CRITICALITIES,
  LOGISTICS_STATUSES,
  READINESS_STATUSES,
  RESPONSIBLE_PARTIES,
  USAGE_PHASES,
} from "@/types/domain";

/**
 * Filtros da lista de necessidades (SDD, seção 16): combináveis, persistidos
 * na URL, com busca que ignora acentos. Tudo puro e testável.
 */

export const NEED_VIEWS = [
  "lista",
  "categoria",
  "fase",
  "prontidao",
  "responsavel",
] as const;
export type NeedView = (typeof NEED_VIEWS)[number];

export const needFiltersSchema = z.object({
  q: z.string().trim().max(120).optional(),
  categoria: z.enum(CATEGORIES).optional(),
  fase: z.enum(USAGE_PHASES).optional(),
  criticidade: z.enum(CRITICALITIES).optional(),
  responsavel: z.enum(RESPONSIBLE_PARTIES).optional(),
  aquisicao: z.enum(ACQUISITION_STATUSES).optional(),
  logistica: z.enum(LOGISTICS_STATUSES).optional(),
  prontidao: z.enum(READINESS_STATUSES).optional(),
  antesDoParto: z.boolean().default(false),
  somentePendencias: z.boolean().default(false),
  somenteCriticas: z.boolean().default(false),
  visao: z.enum(NEED_VIEWS).default("lista"),
  arquivadas: z.boolean().default(false),
});

export type NeedFilters = z.infer<typeof needFiltersSchema>;

export const DEFAULT_FILTERS: NeedFilters = needFiltersSchema.parse({});

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Lê os filtros dos searchParams; valores inválidos voltam ao padrão. */
export function parseNeedFilters(params: RawParams): NeedFilters {
  const candidate = {
    q: first(params.q) || undefined,
    categoria: first(params.categoria),
    fase: first(params.fase),
    criticidade: first(params.criticidade),
    responsavel: first(params.responsavel),
    aquisicao: first(params.aquisicao),
    logistica: first(params.logistica),
    prontidao: first(params.prontidao),
    antesDoParto: first(params.antesDoParto) === "1",
    somentePendencias: first(params.somentePendencias) === "1",
    somenteCriticas: first(params.somenteCriticas) === "1",
    visao: first(params.visao),
    arquivadas: first(params.arquivadas) === "1",
  };
  const result = needFiltersSchema.safeParse(candidate);
  if (result.success) {
    return result.data;
  }
  // Reaproveita o que for válido campo a campo; o restante volta ao padrão.
  const partial: Record<string, unknown> = { ...candidate };
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string") {
      delete partial[key];
    }
  }
  const retry = needFiltersSchema.safeParse(partial);
  return retry.success ? retry.data : DEFAULT_FILTERS;
}

/** Serializa para a URL, omitindo valores padrão. */
export function serializeNeedFilters(filters: NeedFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.categoria) params.set("categoria", filters.categoria);
  if (filters.fase) params.set("fase", filters.fase);
  if (filters.criticidade) params.set("criticidade", filters.criticidade);
  if (filters.responsavel) params.set("responsavel", filters.responsavel);
  if (filters.aquisicao) params.set("aquisicao", filters.aquisicao);
  if (filters.logistica) params.set("logistica", filters.logistica);
  if (filters.prontidao) params.set("prontidao", filters.prontidao);
  if (filters.antesDoParto) params.set("antesDoParto", "1");
  if (filters.somentePendencias) params.set("somentePendencias", "1");
  if (filters.somenteCriticas) params.set("somenteCriticas", "1");
  if (filters.visao !== "lista") params.set("visao", filters.visao);
  if (filters.arquivadas) params.set("arquivadas", "1");
  return params.toString();
}

export function countActiveFilters(filters: NeedFilters): number {
  let count = 0;
  if (filters.q) count += 1;
  if (filters.categoria) count += 1;
  if (filters.fase) count += 1;
  if (filters.criticidade) count += 1;
  if (filters.responsavel) count += 1;
  if (filters.aquisicao) count += 1;
  if (filters.logistica) count += 1;
  if (filters.prontidao) count += 1;
  if (filters.antesDoParto) count += 1;
  if (filters.somentePendencias) count += 1;
  if (filters.somenteCriticas) count += 1;
  if (filters.arquivadas) count += 1;
  return count;
}

/** Normaliza texto para busca sem acento e sem caixa (seções 16 e 24). */
export function normalizeSearchText(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export type FilterableNeed = ProductNeedInput & {
  id: string;
  title: string;
  category: (typeof CATEGORIES)[number];
  phase: (typeof USAGE_PHASES)[number];
  criticality: (typeof CRITICALITIES)[number];
  responsible: (typeof RESPONSIBLE_PARTIES)[number];
  dueDate: string | null;
  archivedAt: string | null;
};

export function needMatchesFilters(
  need: FilterableNeed,
  filters: NeedFilters,
): boolean {
  if (
    filters.arquivadas ? need.archivedAt === null : need.archivedAt !== null
  ) {
    return false;
  }
  if (filters.q) {
    const haystack = normalizeSearchText(need.title);
    if (!haystack.includes(normalizeSearchText(filters.q))) {
      return false;
    }
  }
  if (filters.categoria && need.category !== filters.categoria) return false;
  if (filters.fase && need.phase !== filters.fase) return false;
  if (filters.criticidade && need.criticality !== filters.criticidade) {
    return false;
  }
  if (filters.responsavel && need.responsible !== filters.responsavel) {
    return false;
  }
  if (filters.aquisicao && need.acquisitionStatus !== filters.aquisicao) {
    return false;
  }
  if (filters.logistica && need.logisticsStatus !== filters.logistica) {
    return false;
  }
  if (filters.prontidao && need.readinessStatus !== filters.prontidao) {
    return false;
  }
  if (filters.antesDoParto && need.phase !== "antes_do_parto") return false;
  if (filters.somenteCriticas && need.criticality !== "critica") return false;
  if (filters.somentePendencias) {
    const readiness = productNeedReadiness(need);
    const isPending = readiness < 1 && need.decisionStatus !== "descartado";
    if (!isPending) return false;
  }
  return true;
}

/**
 * Ordenação padrão da lista: criticidade (peso), prazo mais próximo,
 * título alfabético — determinística para 131 itens.
 */
export function compareNeeds(a: FilterableNeed, b: FilterableNeed): number {
  const weight = { critica: 0, alta: 1, media: 2, baixa: 3 } as const;
  if (weight[a.criticality] !== weight[b.criticality]) {
    return weight[a.criticality] - weight[b.criticality];
  }
  if (a.dueDate !== b.dueDate) {
    if (a.dueDate === null) return 1;
    if (b.dueDate === null) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  }
  return a.title.localeCompare(b.title, "pt-BR");
}
