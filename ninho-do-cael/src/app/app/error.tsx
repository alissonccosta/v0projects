"use client";

import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import * as React from "react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Observabilidade estruturada chega junto com o backend (Fase 2+).
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      icon={WarningCircleIcon}
      title="Algo deu errado"
      description="A tela não pôde ser exibida. Nenhum dado foi perdido — você pode tentar novamente."
      action={<Button onClick={reset}>Tentar novamente</Button>}
    />
  );
}
