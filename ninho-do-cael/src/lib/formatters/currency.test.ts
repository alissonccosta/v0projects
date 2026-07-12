import { describe, expect, it } from "vitest";

import { formatBRL } from "@/lib/formatters/currency";

describe("formatBRL", () => {
  it("formata em real brasileiro", () => {
    // O espaço após R$ é um NBSP.
    expect(formatBRL(1259.1)).toBe("R$ 1.259,10");
    expect(formatBRL(0)).toBe("R$ 0,00");
  });
});
