import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = { title: "Configurações" };

export default function ConfiguracoesPage() {
  return <ModulePlaceholder moduleKey="configuracoes" />;
}
