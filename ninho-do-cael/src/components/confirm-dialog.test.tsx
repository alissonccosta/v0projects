import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";

function renderConfirm(onConfirm: () => void) {
  return render(
    <ConfirmDialog
      trigger={<Button>Arquivar</Button>}
      title="Arquivar este item?"
      description="Pode ser restaurado depois."
      confirmLabel="Arquivar item"
      onConfirm={onConfirm}
    />,
  );
}

describe("ConfirmDialog", () => {
  it("só executa a ação após confirmação explícita", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderConfirm(onConfirm);

    await user.click(screen.getByRole("button", { name: "Arquivar" }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: "Arquivar este item?" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Arquivar item" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("cancelar fecha sem executar a ação", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderConfirm(onConfirm);

    await user.click(screen.getByRole("button", { name: "Arquivar" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("heading", { name: "Arquivar este item?" }),
    ).not.toBeInTheDocument();
  });
});
