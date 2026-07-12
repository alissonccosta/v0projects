import {
  CaretRightIcon,
  DatabaseIcon,
  PlugsIcon,
  SignOutIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { logout } from "@/lib/auth/actions";
import { getSessionInfo } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const session = await getSessionInfo();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Configurações
        </h1>
      </header>

      <Card>
        <CardContent className="flex flex-col divide-y divide-sand/60 p-0 sm:p-0">
          <Link
            href="/app/configuracoes/familia"
            className="flex min-h-14 items-center gap-3 px-5 py-3 transition-colors duration-150 outline-none hover:bg-secondary/40 focus-visible:ring-2 focus-visible:ring-ring sm:px-6"
          >
            <UsersThreeIcon
              size={22}
              aria-hidden="true"
              className="text-moss-700"
            />
            <span className="flex-1">
              <span className="block font-semibold text-forest-900">
                Família
              </span>
              <span className="block text-sm text-text-secondary">
                Membros, bebê e convites
              </span>
            </span>
            <CaretRightIcon
              size={18}
              aria-hidden="true"
              className="text-text-secondary"
            />
          </Link>

          <div className="flex min-h-14 items-center gap-3 px-5 py-3 sm:px-6">
            <PlugsIcon
              size={22}
              aria-hidden="true"
              className="text-text-secondary"
            />
            <span className="flex-1">
              <span className="block font-semibold text-text-secondary">
                Integração com o Notion
              </span>
              <span className="block text-sm text-text-secondary">
                Importação, sincronização e conflitos
              </span>
            </span>
            <Badge tone="outline">Fase 7</Badge>
          </div>

          <div className="flex min-h-14 items-center gap-3 px-5 py-3 sm:px-6">
            <DatabaseIcon
              size={22}
              aria-hidden="true"
              className="text-text-secondary"
            />
            <span className="flex-1">
              <span className="block font-semibold text-text-secondary">
                Dados e exportação
              </span>
              <span className="block text-sm text-text-secondary">
                Exportar e restaurar informações
              </span>
            </span>
            <Badge tone="outline">Fase 9</Badge>
          </div>
        </CardContent>
      </Card>

      {session.mode === "demo" ? (
        <p className="rounded-md bg-warning-soft p-4 text-sm leading-relaxed text-warning-strong">
          Este ambiente está sem autenticação porque o Supabase ainda não foi
          configurado. Siga o guia docs/setup-supabase.md para ativar login,
          família e convites.
        </p>
      ) : null}

      {session.mode === "member" ? (
        <Card>
          <CardContent className="flex items-center justify-between gap-3 py-4 sm:py-4">
            <div>
              <p className="font-semibold text-forest-900">
                {session.displayName}
              </p>
              <p className="text-sm text-text-secondary">{session.email}</p>
            </div>
            <form action={logout}>
              <Button type="submit" variant="outline" className="gap-1.5">
                <SignOutIcon size={18} aria-hidden="true" />
                Sair
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
