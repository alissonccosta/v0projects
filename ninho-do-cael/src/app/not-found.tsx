import { CompassIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-16">
      <EmptyState
        icon={CompassIcon}
        title="Página não encontrada"
        description="O endereço não existe ou mudou de lugar."
        action={
          <Link href="/app/dashboard" className={buttonVariants()}>
            Ir para o início
          </Link>
        }
        className="w-full max-w-md"
      />
    </main>
  );
}
