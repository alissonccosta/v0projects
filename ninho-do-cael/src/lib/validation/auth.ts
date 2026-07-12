import { z } from "zod";

/** Schemas dos fluxos de autenticação e onboarding (SDD, seções 27 e 29). */

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
});

export const onboardingSchema = z.object({
  householdName: z.string().trim().min(1, "Dê um nome à família."),
  displayName: z.string().trim().min(1, "Informe seu nome."),
  babyName: z.string().trim().min(1, "Informe o nome do bebê."),
  dueDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  birthType: z.string().trim().max(80).optional(),
  maternity: z.string().trim().max(160).optional(),
  city: z.string().trim().max(120).optional(),
  state: z.string().trim().max(40).optional(),
});

export const createInviteSchema = z.object({
  email: z.email("Informe um e-mail válido."),
});

export const acceptInviteSchema = z.object({
  displayName: z.string().trim().min(1, "Informe seu nome."),
  token: z.uuid("Convite inválido."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
