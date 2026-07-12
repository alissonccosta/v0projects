import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "@/app/page";

describe("página inicial (Fase 0)", () => {
  it("apresenta o nome do produto e o estado atual do projeto", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Ninho do Cael" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Fase 0 — Preparação")).toBeInTheDocument();
  });

  it("não expõe nenhum controle interativo sem função (SDD, seção 0.2)", () => {
    const { container } = render(<Home />);
    expect(
      container.querySelectorAll("button, a, input, select, textarea"),
    ).toHaveLength(0);
  });
});
