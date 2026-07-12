import { redirect } from "next/navigation";

import { AppShell, type ShellSession } from "@/components/app-shell/app-shell";
import { getSessionInfo } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionInfo();

  if (session.mode === "unauthenticated") {
    redirect("/login?next=%2Fapp%2Fdashboard");
  }
  if (session.mode === "needs_onboarding") {
    redirect("/onboarding");
  }

  const shellSession: ShellSession =
    session.mode === "demo"
      ? { mode: "demo" }
      : {
          mode: "member",
          displayName: session.displayName,
          email: session.email,
          role: session.role,
        };

  return <AppShell session={shellSession}>{children}</AppShell>;
}
