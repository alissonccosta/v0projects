"use client";

import { DotsThreeOutlineIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MOBILE_NAV, MORE_NAV } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Navegação inferior mobile (SDD, seção 11.3): Início, Necessidades,
 * Tarefas, Compras e Mais. Toque mínimo de 44×44 (seção 13.2).
 */
export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = React.useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  const moreActive = MORE_NAV.some((item) => isActive(item.href));

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-sand bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {MOBILE_NAV.map((item) => {
          const active = isActive(item.href);
          const IconComponent = item.icon;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium text-text-secondary transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  active && "font-semibold text-moss-700",
                )}
              >
                <IconComponent
                  size={24}
                  weight={active ? "fill" : "regular"}
                  aria-hidden="true"
                />
                {item.label}
              </Link>
            </li>
          );
        })}
        <li>
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger
              className={cn(
                "flex min-h-14 w-full cursor-pointer flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium text-text-secondary transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                moreActive && "font-semibold text-moss-700",
              )}
            >
              <DotsThreeOutlineIcon
                size={24}
                weight={moreActive ? "fill" : "regular"}
                aria-hidden="true"
              />
              Mais
            </SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>Mais seções</SheetTitle>
                <SheetDescription>
                  Estoque, decisões, jornada, orçamento e configurações.
                </SheetDescription>
              </SheetHeader>
              <ul className="flex flex-col gap-1">
                {MORE_NAV.map((item) => {
                  const active = isActive(item.href);
                  const IconComponent = item.icon;
                  return (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          "flex min-h-12 items-center gap-3 rounded-md px-3 text-[15px] font-medium text-text-primary transition-colors duration-150 outline-none hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring",
                          active && "bg-sage-100 font-semibold text-moss-700",
                        )}
                      >
                        <IconComponent
                          size={22}
                          weight={active ? "fill" : "regular"}
                          aria-hidden="true"
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}
