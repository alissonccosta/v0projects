"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/app-shell/logo";
import { SyncIndicator } from "@/components/sync/sync-indicator";
import { PRIMARY_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Sidebar desktop (SDD, seções 11.2 e 13.3). Perfil e sair entram na Fase 2,
 * junto com a autenticação — até lá não exibimos controles sem função.
 */
export function Sidebar() {
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
      <div className="border-t border-sand px-5 py-4">
        <SyncIndicator status="not_linked" />
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          A integração com o Notion é configurada na Fase 7.
        </p>
      </div>
    </aside>
  );
}
