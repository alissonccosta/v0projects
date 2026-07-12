import { describe, expect, it } from "vitest";

import {
  acceptInviteSchema,
  loginSchema,
  onboardingSchema,
} from "@/lib/validation/auth";

describe("schemas de autenticação", () => {
  it("login exige e-mail válido, com mensagem em português", () => {
    expect(
      loginSchema.safeParse({ email: "alisson@exemplo.com" }).success,
    ).toBe(true);
    const invalid = loginSchema.safeParse({ email: "nada" });
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.error.issues[0]?.message).toBe(
        "Informe um e-mail válido.",
      );
    }
  });

  it("onboarding exige família, nome e bebê; data opcional validada", () => {
    const ok = onboardingSchema.safeParse({
      householdName: "Ninho do Cael",
      displayName: "Alisson",
      babyName: "Cael",
      dueDate: "2026-11-15",
    });
    expect(ok.success).toBe(true);

    const semNome = onboardingSchema.safeParse({
      householdName: "Ninho",
      displayName: " ",
      babyName: "Cael",
    });
    expect(semNome.success).toBe(false);

    const dataInvalida = onboardingSchema.safeParse({
      householdName: "Ninho",
      displayName: "Alisson",
      babyName: "Cael",
      dueDate: "15/11/2026",
    });
    expect(dataInvalida.success).toBe(false);

    const dataVazia = onboardingSchema.safeParse({
      householdName: "Ninho",
      displayName: "Alisson",
      babyName: "Cael",
      dueDate: "",
    });
    expect(dataVazia.success).toBe(true);
    if (dataVazia.success) {
      expect(dataVazia.data.dueDate).toBeUndefined();
    }
  });

  it("aceite de convite valida token uuid", () => {
    expect(
      acceptInviteSchema.safeParse({
        displayName: "Duda",
        token: "ce3fe570-7121-4e8f-a63a-0e89bbf11d28",
      }).success,
    ).toBe(true);
    expect(
      acceptInviteSchema.safeParse({ displayName: "Duda", token: "abc" })
        .success,
    ).toBe(false);
  });
});
