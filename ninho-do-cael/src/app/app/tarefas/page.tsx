import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = { title: "Tarefas" };

export default function TarefasPage() {
  return <ModulePlaceholder moduleKey="tarefas" />;
}
