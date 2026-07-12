"use client";

import { SignOutIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ShellSession } from "@/components/app-shell/app-shell";
import { Logo } from "@/components/app-shell/logo";
import { SyncIndicator } from "@/components/sync/sync-indicator";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
import { PRIMARY_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const ROLE_LABELS = {
  owner: "Administrador do Ninho",
  collaborator: "Colaboradora familiar",
} as const;

/**
 * Sidebar desktop (SDD, seções 11.2 e 13.3): navegação, sincronização,
 * perfil e sair.
 */
export function Sidebar({ session }: { session: ShellSession }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-sand bg-surface lg:flex">
      <div className="flex h-16 items-center gap-3 px-5">
        <Logo />
        <span className="font-display text-lg font-semibold text-forest-900">
          Ninho do Cael
        </span>
      </div>
      <nav
        aria-label="Navegação principal"
        className="flex-1 overflow-y-auto px-3 py-2"
      >
        <ul className="flex flex-col gap-1">
          {PRIMARY_NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const IconComponent = item.icon;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-md px-3 text-[15px] font-medium text-text-secondary transition-colors duration-150 outline-none hover:bg-secondary/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                    active && "bg-sage-100 font-semibold text-moss-700",
                  )}
                >
                  <IconComponent
                    size={20}
                    weight={active ? "fill" : "regular"}
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex flex-col gap-3 border-t border-sand px-5 py-4">
        <SyncIndicator status="not_linked" />
        {session.mode === "member" ? (
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-forest-900">
                {session.displayName}
              </p>
              <p className="truncate text-xs text-text-secondary">
                {ROLE_LABELS[session.role]}
              </p>
            </div>
            <form action={logout}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="gap-1.5"
              >
                <SignOutIcon size={16} aria-hidden="true" />
                Sair
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <span className="w-fit rounded-full border border-warning/30 bg-warning-soft px-2.5 py-0.5 text-xs font-semibold text-warning-strong">
              Sem autenticação
            </span>
            <p className="text-xs leading-relaxed text-text-secondary">
              Configure o Supabase para ativar login e convites
              (docs/setup-supabase.md).
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
