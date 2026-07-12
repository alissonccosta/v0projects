import { BabyIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionInfo } from "@/lib/auth/session";
import { formatDateLongBR } from "@/lib/formatters/date";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { InviteSection } from "./invite-section";

export const metadata: Metadata = { title: "Família" };

const ROLE_LABELS = {
  owner: "Administrador do Ninho",
  collaborator: "Colaboradora familiar",
} as const;

export default async function FamiliaPage() {
  const session = await getSessionInfo();

  if (session.mode !== "member") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Família
        </h1>
        <EmptyState
          icon={UsersThreeIcon}
          title="Disponível após configurar a autenticação"
          description="Com o Supabase configurado (docs/setup-supabase.md), esta página mostra os membros da família, os dados do bebê e os convites."
        />
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();

  const [{ data: baby }, { data: members }, { data: invites }] =
    await Promise.all([
      supabase
        .from("babies")
        .select("name, due_date, planned_birth_type, maternity, city, state")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("id, display_name, role")
        .order("created_at", { ascending: true }),
      session.role === "owner"
        ? supabase
            .from("household_invites")
            .select("id, email, token, expires_at, accepted_at, revoked_at")
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: null }),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Família
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          {session.householdName}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BabyIcon size={20} aria-hidden="true" className="text-moss-700" />
            {baby?.name ?? "Bebê"}
          </CardTitle>
          <CardDescription>
            Dados usados na jornada e no painel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {baby?.due_date ? (
              <div>
                <dt className="text-text-secondary">Data prevista do parto</dt>
                <dd className="font-medium text-forest-900">
                  {formatDateLongBR(baby.due_date)}
                </dd>
              </div>
            ) : null}
            {baby?.planned_birth_type ? (
              <div>
                <dt className="text-text-secondary">Tipo de parto previsto</dt>
                <dd className="font-medium text-forest-900">
                  {baby.planned_birth_type}
                </dd>
              </div>
            ) : null}
            {baby?.maternity ? (
              <div>
                <dt className="text-text-secondary">Maternidade</dt>
                <dd className="font-medium text-forest-900">
                  {baby.maternity}
                </dd>
              </div>
            ) : null}
            {baby?.city ? (
              <div>
                <dt className="text-text-secondary">Cidade</dt>
                <dd className="font-medium text-forest-900">
                  {baby.city}
                  {baby.state ? ` — ${baby.state}` : ""}
                </dd>
              </div>
            ) : null}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Membros</CardTitle>
          <CardDescription>
            Quem acompanha o enxoval nesta família.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3">
            {(members ?? []).map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between gap-3"
              >
                <span className="font-medium text-forest-900">
                  {member.display_name}
                </span>
                <Badge tone={member.role === "owner" ? "sage" : "neutral"}>
                  {ROLE_LABELS[member.role as keyof typeof ROLE_LABELS]}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {session.role === "owner" ? (
        <InviteSection invites={invites ?? []} />
      ) : (
        <p className="text-sm leading-relaxed text-text-secondary">
          Convites para novos membros são gerenciados por quem administra o
          Ninho.
        </p>
      )}
    </div>
  );
}
