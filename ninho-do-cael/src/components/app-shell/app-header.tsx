"use client";

import { usePathname } from "next/navigation";

import { Logo } from "@/components/app-shell/logo";
import { GlobalSearch } from "@/components/search/global-search";
import { SyncIndicator } from "@/components/sync/sync-indicator";
import { findModuleByPathname } from "@/lib/navigation";

/**
 * Header do app (SDD, seção 13.3): 64px, breadcrumb no desktop e
 * identidade + sincronização no mobile. Em modo demonstração (Supabase não
 * configurado), um banner discreto de largura total avisa a ausência de
 * autenticação — sem estourar o viewport móvel.
 */
export function AppHeader({ demoMode = false }: { demoMode?: boolean }) {
  const pathname = usePathname();
  const currentModule = findModuleByPathname(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-sand bg-canvas/95 backdrop-blur-none">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3 lg:hidden">
          <Logo className="size-7" />
          <span className="font-display text-base font-semibold text-forest-900">
            Ninho do Cael
          </span>
        </div>
        <nav
          aria-label="Localização"
          className="hidden items-center gap-2 text-sm lg:flex"
        >
          <span className="text-text-secondary">Ninho do Cael</span>
          {currentModule ? (
            <>
              <span aria-hidden="true" className="text-sand">
                /
              </span>
              <span
                aria-current="page"
                className="font-semibold text-forest-900"
              >
                {currentModule.label}
              </span>
            </>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          {!demoMode ? <GlobalSearch /> : null}
          <SyncIndicator status="not_linked" />
        </div>
      </div>
      {demoMode ? (
        <p className="border-t border-warning/20 bg-warning-soft px-4 py-1.5 text-center text-xs font-medium text-warning-strong sm:px-6">
          Sem autenticação — configure o Supabase (docs/setup-supabase.md)
        </p>
      ) : null}
    </header>
  );
}
