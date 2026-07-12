import { describe, expect, it } from "vitest";

import { formatDateBR, formatDateLongBR } from "@/lib/formatters/date";

describe("formatadores de data (locale pt-BR)", () => {
  it("formata data curta", () => {
    expect(formatDateBR("2026-11-15")).toBe("15/11/2026");
  });

  it("formata data por extenso", () => {
    expect(formatDateLongBR("2026-11-15")).toBe("15 de novembro de 2026");
  });
});
