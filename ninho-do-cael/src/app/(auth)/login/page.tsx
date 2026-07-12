import { PlugsIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { sanitizeNextPath } from "@/lib/auth/route-guard";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

const ERROR_MESSAGES: Record<string, string> = {
  confirmacao:
    "O link de acesso não pôde ser confirmado. Ele pode ter expirado — envie um novo.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; erro?: string }>;
}) {
  const params = await searchParams;
  const next = sanitizeNextPath(params.next);
  const errorMessage = params.erro ? ERROR_MESSAGES[params.erro] : undefined;

  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        icon={PlugsIcon}
        title="Autenticação ainda não configurada"
        description="Este ambiente está rodando sem o Supabase. Configure as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY seguindo o guia docs/setup-supabase.md e o login por e-mail passa a funcionar."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">Entrar</CardTitle>
        <CardDescription>
          Informe seu e-mail e enviaremos um link de acesso. Sem senha.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm next={next} externalError={errorMessage} />
      </CardContent>
    </Card>
  );
}
