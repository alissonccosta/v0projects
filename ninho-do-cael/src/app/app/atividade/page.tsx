import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = { title: "Atividade" };

export default function AtividadePage() {
  return <ModulePlaceholder moduleKey="atividade" />;
}
