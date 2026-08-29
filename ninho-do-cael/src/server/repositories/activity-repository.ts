import type { SupabaseClient } from "@supabase/supabase-js";

/** Histórico de qualquer entidade (SDD, seção 26). */

export type ActivityRow = {
  id: string;
  action: string;
  changes: Record<string, unknown> | null;
  origin: string;
  created_at: string;
  actor: { display_name: string } | null;
};

export async function listEntityActivity(
  supabase: SupabaseClient,
  entityType: string,
  entityId: string,
): Promise<ActivityRow[]> {
  const { data, error } = await supabase
    .from("activity_logs")
    .select(
      "id, action, changes, origin, created_at, actor:profiles(display_name)",
    )
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    throw new Error(`Falha ao carregar o histórico: ${error.message}`);
  }
  return (data ?? []) as unknown as ActivityRow[];
}

export type ActivityFeedItem = ActivityRow & {
  entity_type: string;
  entity_id: string;
  /** Título e link resolvidos da entidade (null quando ela já não existe). */
  target_title: string | null;
  target_href: string | null;
};

/** Rótulo do módulo quando a entidade não tem página própria. */
const ENTITY_HREFS: Record<string, string> = {
  product: "/app/produtos",
  inventory: "/app/estoque",
  household: "/app/configuracoes/familia",
  invite: "/app/configuracoes/familia",
  profile: "/app/configuracoes/familia",
};

/**
 * Feed recente (seções 15.7 e 26): últimas alterações com o título da
 * entidade resolvido em lotes — sem N+1 (seção 32).
 */
export async function listRecentActivity(
  supabase: SupabaseClient,
  limit = 50,
): Promise<ActivityFeedItem[]> {
  const { data, error } = await supabase
    .from("activity_logs")
    .select(
      "id, entity_type, entity_id, action, changes, origin, created_at, actor:profiles(display_name)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    throw new Error(`Falha ao carregar a atividade: ${error.message}`);
  }
  const rows = (data ?? []) as unknown as Array<
    ActivityRow & { entity_type: string; entity_id: string }
  >;

  const idsByType = new Map<string, Set<string>>();
  for (const row of rows) {
    const set = idsByType.get(row.entity_type) ?? new Set<string>();
    set.add(row.entity_id);
    idsByType.set(row.entity_type, set);
  }

  const titleSources: Array<{
    type: string;
    table: string;
    column: string;
    href: (id: string) => string;
  }> = [
    {
      type: "need",
      table: "needs",
      column: "title",
      href: (id) => `/app/necessidades/${id}`,
    },
    {
      type: "task",
      table: "tasks",
      column: "title",
      href: (id) => `/app/tarefas/${id}`,
    },
    {
      type: "decision",
      table: "decisions",
      column: "title",
      href: (id) => `/app/decisoes/${id}`,
    },
    {
      type: "purchase",
      table: "purchases",
      column: "title",
      href: (id) => `/app/compras/${id}`,
    },
    {
      type: "product",
      table: "products",
      column: "name",
      href: () => "/app/produtos",
    },
    {
      type: "inventory",
      table: "inventory_items",
      column: "name",
      href: () => "/app/estoque",
    },
  ];

  const resolved = new Map<string, { title: string; href: string }>();
  await Promise.all(
    titleSources.map(async (source) => {
      const ids = idsByType.get(source.type);
      if (!ids || ids.size === 0) return;
      const { data: targets } = await supabase
        .from(source.table)
        .select(`id, ${source.column}`)
        .in("id", [...ids]);
      for (const target of (targets ?? []) as unknown as Array<
        Record<string, string>
      >) {
        resolved.set(`${source.type}:${target.id}`, {
          title: target[source.column] ?? "",
          href: source.href(target.id!),
        });
      }
    }),
  );

  return rows.map((row) => {
    const target = resolved.get(`${row.entity_type}:${row.entity_id}`);
    return {
      ...row,
      target_title: target?.title ?? null,
      target_href: target?.href ?? ENTITY_HREFS[row.entity_type] ?? null,
    };
  });
}
