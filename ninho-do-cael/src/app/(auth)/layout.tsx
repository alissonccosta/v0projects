import { Logo } from "@/components/app-shell/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <Logo />
        <span className="font-display text-xl font-semibold text-forest-900">
          Ninho do Cael
        </span>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
