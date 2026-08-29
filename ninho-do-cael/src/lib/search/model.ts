import { normalizeSearchText } from "@/lib/needs/filters";

/**
 * Pesquisa global (SDD, seção 24): necessidades, produtos, compras, tarefas
 * e decisões; ignora acento e prioriza o título. Pura — a API monta os
 * documentos e esta função ordena e corta.
 */

export const SEARCH_ENTITY_LABELS = {
  necessidade: "Necessidades",
  produto: "Produtos",
  compra: "Compras",
  tarefa: "Tarefas",
  decisao: "Decisões",
} as const;

export type SearchEntity = keyof typeof SEARCH_ENTITY_LABELS;

const ENTITY_ORDER: SearchEntity[] = [
  "necessidade",
  "produto",
  "compra",
  "tarefa",
  "decisao",
];

export type SearchDoc = {
  entity: SearchEntity;
  id: string;
  title: string;
  /** Contexto secundário pesquisável (marca, fornecedor, pergunta…). */
  subtitle: string | null;
  href: string;
};

export type SearchResult = SearchDoc & {
  /** 0 = título começa com o termo; 1 = título contém; 2 = subtítulo contém. */
  rank: 0 | 1 | 2;
};

export function searchDocs(
  docs: SearchDoc[],
  query: string,
  limit = 12,
): SearchResult[] {
  const term = normalizeSearchText(query.trim());
  if (term.length === 0) return [];

  const ranked: SearchResult[] = [];
  for (const doc of docs) {
    const title = normalizeSearchText(doc.title);
    const subtitle = doc.subtitle ? normalizeSearchText(doc.subtitle) : "";
    let rank: SearchResult["rank"] | null = null;
    if (title.startsWith(term)) rank = 0;
    else if (title.includes(term)) rank = 1;
    else if (subtitle.includes(term)) rank = 2;
    if (rank !== null) ranked.push({ ...doc, rank });
  }

  ranked.sort(
    (a, b) =>
      a.rank - b.rank ||
      ENTITY_ORDER.indexOf(a.entity) - ENTITY_ORDER.indexOf(b.entity) ||
      a.title.localeCompare(b.title, "pt-BR"),
  );
  return ranked.slice(0, limit);
}

/** Agrupa resultados já ordenados por entidade, preservando a ordem. */
export function groupSearchResults(
  results: SearchResult[],
): Array<{ entity: SearchEntity; label: string; items: SearchResult[] }> {
  return ENTITY_ORDER.map((entity) => ({
    entity,
    label: SEARCH_ENTITY_LABELS[entity],
    items: results.filter((result) => result.entity === entity),
  })).filter((group) => group.items.length > 0);
}
