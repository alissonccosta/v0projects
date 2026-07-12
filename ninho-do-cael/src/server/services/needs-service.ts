import type { SupabaseClient } from "@supabase/supabase-js";

import { diffChanges } from "@/lib/needs/diff";
import type { CreateNeedInput, UpdateNeedInput } from "@/lib/validation/needs";
import {
  getNeedById,
  insertActivityLog,
  insertNeed,
  updateNeedRow,
  type NeedRow,
} from "@/server/repositories/needs-repository";

/**
 * Regras de escrita de necessidades: persistir, registrar histórico
 * (seção 26) e aplicar soft delete (seção 10.10).
 */

type Actor = { profileId: string; householdId: string };

export async function createNeed(
  supabase: SupabaseClient,
  actor: Actor,
  input: CreateNeedInput,
): Promise<NeedRow> {
  const row = await insertNeed(supabase, {
    ...input,
    household_id: actor.householdId,
  });
  await insertActivityLog(supabase, {
    household_id: actor.householdId,
    actor_profile_id: actor.profileId,
    entity_type: "need",
    entity_id: row.id,
    action: "criacao",
    changes: { title: input.title },
  });
  return row;
}

export class NeedNotFoundError extends Error {
  constructor() {
    super("Necessidade não encontrada.");
    this.name = "NeedNotFoundError";
  }
}

export async function updateNeed(
  supabase: SupabaseClient,
  actor: Actor,
  id: string,
  input: UpdateNeedInput,
): Promise<NeedRow> {
  const before = await getNeedById(supabase, id);
  if (!before) {
    throw new NeedNotFoundError();
  }

  const { arquivada, ...fields } = input;
  const patch: Record<string, unknown> = { ...fields };

  let action: "atualizacao" | "arquivamento" | "restauracao" = "atualizacao";
  if (arquivada === true && before.archived_at === null) {
    patch.archived_at = new Date().toISOString();
    patch.archived_by = actor.profileId;
    action = "arquivamento";
  } else if (arquivada === false && before.archived_at !== null) {
    patch.archived_at = null;
    patch.archived_by = null;
    action = "restauracao";
  }

  const changes = diffChanges(
    before as unknown as Record<string, unknown>,
    patch,
  );
  if (Object.keys(changes).length === 0) {
    return before;
  }

  const row = await updateNeedRow(supabase, id, patch);
  await insertActivityLog(supabase, {
    household_id: actor.householdId,
    actor_profile_id: actor.profileId,
    entity_type: "need",
    entity_id: id,
    action,
    changes,
  });
  return row;
}
