import { AppHeader } from "@/components/app-shell/app-header";
import { BottomNav } from "@/components/app-shell/bottom-nav";
import { Sidebar } from "@/components/app-shell/sidebar";

export type ShellSession =
  | { mode: "demo" }
  | {
      mode: "member";
      displayName: string;
      email: string;
      role: "owner" | "collaborator";
    };

/**
 * Casca da aplicação (SDD, seção 14 — AppShell): sidebar no desktop,
 * header fixo e navegação inferior no mobile, com link de salto para o
 * conteúdo (acessibilidade, seção 31).
 */
export function AppShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: ShellSession;
}) {
  return (
    <div className="min-h-dvh w-full">
      <a
        href="#conteudo"
        className="sr-only rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Pular para o conteúdo
      </a>
      <Sidebar session={session} />
      <div className="flex min-h-dvh flex-col lg:pl-60">
        <AppHeader demoMode={session.mode === "demo"} />
        <main
          id="conteudo"
          className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 lg:pb-10"
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
