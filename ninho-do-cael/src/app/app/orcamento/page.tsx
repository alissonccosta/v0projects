import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = { title: "Orçamento" };

export default function OrcamentoPage() {
  return <ModulePlaceholder moduleKey="orcamento" />;
}
