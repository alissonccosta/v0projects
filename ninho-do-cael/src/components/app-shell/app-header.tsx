"use client";

import { usePathname } from "next/navigation";

import { Logo } from "@/components/app-shell/logo";
import { SyncIndicator } from "@/components/sync/sync-indicator";
import { findModuleByPathname } from "@/lib/navigation";

/**
 * Header do app (SDD, seção 13.3): 64px, breadcrumb no desktop e
 * identidade + sincronização no mobile.
 */
export function AppHeader() {
  const pathname = usePathname();
  const currentModule = findModuleByPathname(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-sand bg-canvas/95 px-4 backdrop-blur-none sm:px-6">
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
            <span aria-current="page" className="font-semibold text-forest-900">
              {currentModule.label}
            </span>
          </>
        ) : null}
      </nav>
      <SyncIndicator status="not_linked" />
    </header>
  );
}
