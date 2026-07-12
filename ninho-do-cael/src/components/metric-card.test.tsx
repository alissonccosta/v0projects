import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";

describe("MetricCard", () => {
  it("mostra título, valor, unidade e contexto", () => {
    render(
      <MetricCard
        title="Prontidão geral"
        value="62"
        unit="%"
        context="Ponderada por criticidade"
      />,
    );
    expect(screen.getByText("Prontidão geral")).toBeInTheDocument();
    expect(screen.getByText("62")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
    expect(screen.getByText("Ponderada por criticidade")).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("explica o vazio e renderiza a ação quando fornecida", () => {
    render(
      <EmptyState
        title="Nada por aqui"
        description="Explicação do vazio."
        action={<button type="button">Ação útil</button>}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Nada por aqui" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ação útil" }),
    ).toBeInTheDocument();
  });
});
