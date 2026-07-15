"use client";

import {
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import * as React from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { idleState, type ActionState } from "@/lib/auth/action-state";
import {
  cancelarTarefa,
  concluirTarefa,
  iniciarTarefa,
  retomarTarefa,
} from "@/lib/tasks/actions";
import type { TaskStatus } from "@/types/domain";

/**
 * Ações do detalhe da tarefa (seção 20). Concluir exige confirmar o
 * critério; cancelar pede confirmação; retomar reabre concluídas e
 * destrava bloqueadas.
 */
export function TaskActions({
  taskId,
  status,
  completionCriteria,
}: {
  taskId: string;
  status: TaskStatus;
  completionCriteria: string | null;
}) {
  const [pending, startTransition] = React.useTransition();

  function run(action: (id: string) => Promise<ActionState>) {
    startTransition(async () => {
      const result = await action(taskId);
      if (result.status === "success") toast(result.message ?? "Feito.");
      else if (result.status === "error") toast.error(result.message);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "planejada" ? (
        <Button
          variant="secondary"
          className="gap-1.5"
          disabled={pending}
          onClick={() => run(iniciarTarefa)}
        >
          <PlayCircleIcon size={18} aria-hidden="true" />
          Iniciar
        </Button>
      ) : null}
      {status === "bloqueada" || status === "cancelada" ? (
        <Button
          variant="secondary"
          className="gap-1.5"
          disabled={pending}
          onClick={() => run(retomarTarefa)}
        >
          <PlayCircleIcon size={18} aria-hidden="true" />
          Retomar
        </Button>
      ) : null}
      {status !== "concluida" && status !== "cancelada" ? (
        <CompleteDialog
          taskId={taskId}
          completionCriteria={completionCriteria}
        />
      ) : null}
      {status === "concluida" ? (
        <Button
          variant="outline"
          className="gap-1.5"
          disabled={pending}
          onClick={() => run(retomarTarefa)}
        >
          <ArrowCounterClockwiseIcon size={18} aria-hidden="true" />
          Reabrir
        </Button>
      ) : null}
      {status !== "concluida" && status !== "cancelada" ? (
        <ConfirmDialog
          trigger={
            <Button variant="outline" className="gap-1.5" disabled={pending}>
              <XCircleIcon size={18} aria-hidden="true" />
              Cancelar tarefa
            </Button>
          }
          title="Cancelar esta tarefa?"
          description="Ela sai das visões ativas, mas continua no histórico e pode ser retomada."
          confirmLabel="Cancelar tarefa"
          destructive
          onConfirm={async () => {
            const result = await cancelarTarefa(taskId);
            if (result.status === "success") toast(result.message ?? "Feito.");
            else if (result.status === "error") toast.error(result.message);
          }}
        />
      ) : null}
    </div>
  );
}

function CompleteDialog({
  taskId,
  completionCriteria,
}: {
  taskId: string;
  completionCriteria: string | null;
}) {
  const [open, setOpen] = React.useState(false);
  const action = concluirTarefa.bind(null, taskId);
  const [state, formAction, pending] = React.useActionState<
    ActionState,
    FormData
  >(action, idleState);
  const fieldErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  React.useEffect(() => {
    if (state.status !== "success") return;
    toast(state.message ?? "Tarefa concluída.");
    const timer = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <CheckCircleIcon size={18} aria-hidden="true" />
          Concluir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Concluir tarefa</DialogTitle>
          <DialogDescription>
            A conclusão só vale com o critério conferido de verdade.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <div className="rounded-md bg-canvas/60 p-3">
            <p className="text-xs font-medium tracking-wide text-text-secondary uppercase">
              Critério de conclusão
            </p>
            <p className="mt-1 text-sm text-forest-900">
              {completionCriteria ??
                "Nenhum critério registrado — confirme que a tarefa foi feita por completo."}
            </p>
          </div>
          <label className="flex min-h-11 cursor-pointer items-start gap-2.5 text-sm text-forest-900">
            <input
              type="checkbox"
              name="criteria_confirmed"
              disabled={pending}
              className="mt-0.5 size-4 accent-moss-700"
            />
            <span>O critério acima foi atendido.</span>
          </label>
          {fieldErrors.criteria_confirmed ? (
            <p role="alert" className="text-sm text-danger-strong">
              {fieldErrors.criteria_confirmed}
            </p>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="completion_notes">Nota (opcional)</Label>
            <Textarea
              id="completion_notes"
              name="completion_notes"
              placeholder="Como foi, o que observar depois…"
              disabled={pending}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="actual_cost"
              name="actual_cost"
              type="number"
              label="Custo real (R$)"
              error={fieldErrors.actual_cost}
              disabled={pending}
            />
            <FormField
              id="completion_reference"
              name="completion_reference"
              label="Referência"
              placeholder="Link, nota fiscal…"
              error={fieldErrors.completion_reference}
              disabled={pending}
            />
          </div>
          {state.status === "error" && !state.fieldErrors ? (
            <p
              role="alert"
              className="rounded-md bg-danger-soft p-3 text-sm text-danger-strong"
            >
              {state.message}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Concluindo…" : "Concluir tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
