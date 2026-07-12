"use client";

import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <ConfirmDialog
        trigger={<Button variant="outline">Abrir confirmação</Button>}
        title="Arquivar este item?"
        description="O item sai das listas, mas continua no histórico e pode ser restaurado."
        confirmLabel="Arquivar"
        onConfirm={() => {
          toast("Confirmação executada", {
            description: "Este é o feedback padrão de ação concluída.",
          });
        }}
      />
      <ConfirmDialog
        trigger={
          <Button variant="destructive">Abrir confirmação destrutiva</Button>
        }
        title="Cancelar o pedido?"
        description="Esta ação marca o pedido como cancelado e ajusta o orçamento."
        confirmLabel="Cancelar pedido"
        destructive
        onConfirm={() => {
          toast("Ação destrutiva confirmada", {
            description:
              "O padrão exige confirmação explícita antes de executar.",
          });
        }}
      />
    </div>
  );
}
