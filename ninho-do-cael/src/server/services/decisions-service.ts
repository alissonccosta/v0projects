import type { SupabaseClient } from "@supabase/supabase-js";

import { isMedicalDecision } from "@/lib/decisions/model";
import { diffChanges } from "@/lib/needs/diff";
import type {
  DecideInput,
  DecisionInput,
  PatchDecisionInput,
} from "@/lib/validation/decisions";
import { insertActivityLog } from "@/server/repositories/needs-repository";
import {
  getDecisionById,
  insertDecision,
  setDecisionNeeds,
  updateDecisionRow,
  type DecisionRow,
} from "@/server/repositories/decisions-repository";
import type { DecisionType } from "@/types/domain";

/**
 * Regras de escrita de decisões (SDD, seções 21 e 10.11): "decidida" só pelo
 * fluxo Decidir, sempre com conclusão registrada; decisões médicas exigem
 * ainda a confirmação de que a orientação veio de profissional — nunca há
 * conclusão automática.
 */

type Actor = { profileId: string; householdId: string };

export class DecisionNotFoundError extends Error {
  constructor() {
    super("Decisão não encontrada.");
    this.name = "DecisionNotFoundError";
  }
}

export class DecisionRuleError extends Error {
  readonly field?: string;
  constructor(message: string, field?: string) {
    super(message);
    this.name = "DecisionRuleError";
    this.field = field;
  }
}

function rowFields(input: DecisionInput | PatchDecisionInput) {
  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (key === "need_ids") continue;
    if (value !== undefined) patch[key] = value;
  }
  return patch;
}

export async function createDecision(
  supabase: SupabaseClient,
  actor: Actor,
  input: DecisionInput,
): Promise<DecisionRow> {
  const row = await insertDecision(supabase, {
    ...rowFields(input),
    household_id: actor.householdId,
  });
  if (input.need_ids.length > 0) {
    await setDecisionNeeds(supabase, actor.householdId, row.id, input.need_ids);
  }
  await insertActivityLog(supabase, {
    household_id: actor.householdId,
    actor_profile_id: actor.profileId,
    entity_type: "decision",
    entity_id: row.id,
    action: "criacao",
    changes: { title: input.title },
  });
  return row;
}

export async function updateDecision(
  supabase: SupabaseClient,
  actor: Actor,
  id: string,
  input: PatchDecisionInput,
): Promise<DecisionRow> {
  const before = await getDecisionById(supabase, id);
  if (!before) {
    throw new DecisionNotFoundError();
  }

  const patch = rowFields(input);

  // Sair de "decidida" reabre a decisão: a conclusão registrada permanece
  // no histórico, mas a data de decisão deixa de valer.
  const nextStatus = (patch.status as string | undefined) ?? before.status;
  if (before.status === "decidida" && nextStatus !== "decidida") {
    patch.decided_at = null;
  }

  const changes = diffChanges(
    before as unknown as Record<string, unknown>,
    patch,
  );

  const needIdsBefore = (before.need_decisions ?? [])
    .map((link) => link.need.id)
    .sort();
  const needIdsAfter = input.need_ids ? [...input.need_ids].sort() : null;
  const needsChanged =
    needIdsAfter !== null &&
    JSON.stringify(needIdsBefore) !== JSON.stringify(needIdsAfter);

  if (Object.keys(changes).length === 0 && !needsChanged) {
    return before;
  }

  const row =
    Object.keys(changes).length > 0
      ? await updateDecisionRow(supabase, id, patch)
      : before;
  if (needsChanged && needIdsAfter) {
    await setDecisionNeeds(supabase, actor.householdId, id, needIdsAfter);
  }

  await insertActivityLog(supabase, {
    household_id: actor.householdId,
    actor_profile_id: actor.profileId,
    entity_type: "decision",
    entity_id: id,
    action: "atualizacao",
    changes: needsChanged
      ? { ...changes, necessidades: { de: needIdsBefore, para: needIdsAfter } }
      : changes,
  });
  return row;
}

/**
 * Fluxo Decidir: conclusão obrigatória; decisão médica exige confirmação
 * explícita de orientação profissional (10.11).
 */
export async function decideDecision(
  supabase: SupabaseClient,
  actor: Actor,
  id: string,
  input: DecideInput,
): Promise<DecisionRow> {
  const before = await getDecisionById(supabase, id);
  if (!before) {
    throw new DecisionNotFoundError();
  }
  if (before.status === "decidida") {
    throw new DecisionRuleError("Esta decisão já foi concluída.");
  }
  if (
    isMedicalDecision(before.type as DecisionType) &&
    !input.medical_confirmed
  ) {
    throw new DecisionRuleError(
      "Decisão médica: confirme que a conclusão veio de profissional que acompanha vocês.",
      "medical_confirmed",
    );
  }

  const patch: Record<string, unknown> = {
    status: "decidida",
    conclusion: input.conclusion,
    decided_at: input.decided_at ?? new Date().toISOString().slice(0, 10),
  };
  if (input.rationale !== undefined) patch.rationale = input.rationale;
  if (input.source !== undefined) patch.source = input.source;
  if (input.confidence !== undefined) patch.confidence = input.confidence;

  const row = await updateDecisionRow(supabase, id, patch);
  await insertActivityLog(supabase, {
    household_id: actor.householdId,
    actor_profile_id: actor.profileId,
    entity_type: "decision",
    entity_id: id,
    action: "conclusao",
    changes: diffChanges(before as unknown as Record<string, unknown>, patch),
  });
  return row;
}
