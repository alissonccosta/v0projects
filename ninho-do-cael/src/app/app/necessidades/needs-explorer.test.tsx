import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { DEFAULT_FILTERS } from "@/lib/needs/filters";
import type { NeedViewModel } from "@/lib/needs/view-model";

import { NeedsExplorer } from "./needs-explorer";

function makeNeed(overrides: Partial<NeedViewModel>): NeedViewModel {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    title: "Berço montessoriano",
    type: "produto",
    audience: "bebe",
    category: "sono",
    priority: "alta",
    criticality: "critica",
    phase: "antes_do_parto",
    decisionStatus: "escolhido",
    acquisitionStatus: "comprado",
    logisticsStatus: "entregue",
    readinessStatus: "precisa_montar",
    responsible: "pai",
    requiredQuantity: 1,
    availableQuantity: 1,
    unit: "un",
    estimatedPrice: 1200,
    paidPrice: 1149.9,
    dueDate: null,
    auditNotes: null,
    originalContent: null,
    originalNotionUrl: null,
    syncStatus: "synced",
    archivedAt: null,
    updatedAt: "2026-07-12T00:00:00Z",
    readiness: 0.8,
    overdue: false,
    ...overrides,
  };
}

const NEEDS: NeedViewModel[] = [
  makeNeed({}),
  makeNeed({
    id: "00000000-0000-4000-8000-000000000002",
    title: "Fraldas RN",
    category: "fraldas",
    criticality: "alta",
    acquisitionStatus: "aguardando_compra",
    logisticsStatus: "nao_confirmado",
    readinessStatus: "nao_aplicavel",
    responsible: "casal",
    readiness: 0.35,
  }),
];

describe("NeedsExplorer", () => {
  it("mostra as necessidades e o contador", () => {
    render(<NeedsExplorer needs={NEEDS} initialFilters={DEFAULT_FILTERS} />);
    expect(screen.getByText("Berço montessoriano")).toBeInTheDocument();
    expect(screen.getByText("Fraldas RN")).toBeInTheDocument();
    expect(screen.getByText("2 de 2")).toBeInTheDocument();
  });

  it("busca sem acento filtra e atualiza a URL", async () => {
    const user = userEvent.setup();
    render(<NeedsExplorer needs={NEEDS} initialFilters={DEFAULT_FILTERS} />);

    await user.type(screen.getByLabelText("Buscar necessidades"), "berco");

    expect(screen.getByText("Berço montessoriano")).toBeInTheDocument();
    expect(screen.queryByText("Fraldas RN")).not.toBeInTheDocument();
    expect(screen.getByText("1 de 2")).toBeInTheDocument();
    expect(window.location.search).toContain("q=berco");
  });

  it("filtro rápido 'Somente críticas' combina com a visão por categoria", async () => {
    const user = userEvent.setup();
    render(<NeedsExplorer needs={NEEDS} initialFilters={DEFAULT_FILTERS} />);

    await user.click(screen.getByRole("button", { name: "Somente críticas" }));
    expect(screen.queryByText("Fraldas RN")).not.toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText("Visualização"),
      "categoria",
    );
    expect(screen.getByRole("heading", { name: /Sono/ })).toBeInTheDocument();
    expect(window.location.search).toContain("somenteCriticas=1");
    expect(window.location.search).toContain("visao=categoria");
  });

  it("filtro sem resultado oferece limpar (estado obrigatório — seção 13.4)", async () => {
    const user = userEvent.setup();
    render(<NeedsExplorer needs={NEEDS} initialFilters={DEFAULT_FILTERS} />);

    await user.type(
      screen.getByLabelText("Buscar necessidades"),
      "inexistente",
    );
    expect(screen.getByText("Nada com esses filtros")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mostrar todas" }));
    expect(screen.getByText("2 de 2")).toBeInTheDocument();
  });
});
