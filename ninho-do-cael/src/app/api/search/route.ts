import type { NextRequest } from "next/server";

import { apiOk } from "@/lib/api/result";
import { requireMemberApi } from "@/lib/api/require-member";
import { searchDocs, type SearchDoc } from "@/lib/search/model";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/search?q= — pesquisa global (seção 24): necessidades, produtos,
 * compras, tarefas e decisões; ignora acento e prioriza o título. O volume é
 * pequeno (D-027), então os títulos são carregados em paralelo e filtrados
 * em memória com as mesmas funções puras testadas.
 */
export async function GET(request: NextRequest) {
  const auth = await requireMemberApi();
  if ("error" in auth) return auth.error;

  const query = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (query.length === 0) {
    return apiOk([], { meta: { q: query } });
  }

  const supabase = await createSupabaseServerClient();
  const [needs, products, purchases, tasks, decisions] = await Promise.all([
    supabase.from("needs").select("id, title").is("archived_at", null),
    supabase
      .from("products")
      .select("id, name, brand, store")
      .is("archived_at", null),
    supabase
      .from("purchases")
      .select("id, title, supplier")
      .is("archived_at", null),
    supabase.from("tasks").select("id, title").is("archived_at", null),
    supabase
      .from("decisions")
      .select("id, title, pending_question")
      .is("archived_at", null),
  ]);

  const docs: SearchDoc[] = [
    ...((needs.data ?? []) as Array<{ id: string; title: string }>).map(
      (row): SearchDoc => ({
        entity: "necessidade",
        id: row.id,
        title: row.title,
        subtitle: null,
        href: `/app/necessidades/${row.id}`,
      }),
    ),
    ...(
      (products.data ?? []) as Array<{
        id: string;
        name: string;
        brand: string | null;
        store: string | null;
      }>
    ).map((row): SearchDoc => ({
      entity: "produto",
      id: row.id,
      title: row.name,
      subtitle: [row.brand, row.store].filter(Boolean).join(" · ") || null,
      href: "/app/produtos",
    })),
    ...(
      (purchases.data ?? []) as Array<{
        id: string;
        title: string;
        supplier: string | null;
      }>
    ).map((row): SearchDoc => ({
      entity: "compra",
      id: row.id,
      title: row.title,
      subtitle: row.supplier,
      href: `/app/compras/${row.id}`,
    })),
    ...((tasks.data ?? []) as Array<{ id: string; title: string }>).map(
      (row): SearchDoc => ({
        entity: "tarefa",
        id: row.id,
        title: row.title,
        subtitle: null,
        href: `/app/tarefas/${row.id}`,
      }),
    ),
    ...(
      (decisions.data ?? []) as Array<{
        id: string;
        title: string;
        pending_question: string | null;
      }>
    ).map((row): SearchDoc => ({
      entity: "decisao",
      id: row.id,
      title: row.title,
      subtitle: row.pending_question,
      href: `/app/decisoes/${row.id}`,
    })),
  ];

  const results = searchDocs(docs, query);
  return apiOk(results, {
    meta: { q: query, total: docs.length, retornados: results.length },
  });
}
