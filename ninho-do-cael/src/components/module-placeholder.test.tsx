import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ModulePlaceholder } from "@/components/module-placeholder";
import { MODULES, type ModuleKey } from "@/lib/navigation";

describe("ModulePlaceholder", () => {
  it("apresenta título do módulo, explicação e fase prevista", () => {
    render(<ModulePlaceholder moduleKey="necessidades" />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Necessidades" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Fase 3 — Necessidades/)).toBeInTheDocument();
  });

  it("nenhum módulo em preparação expõe controles interativos (SDD, seção 0.2)", () => {
    for (const key of Object.keys(MODULES) as ModuleKey[]) {
      const { container, unmount } = render(
        <ModulePlaceholder moduleKey={key} />,
      );
      expect(
        container.querySelectorAll("button, a, input, select, textarea"),
        `módulo ${key}`,
      ).toHaveLength(0);
      unmount();
    }
  });
});
