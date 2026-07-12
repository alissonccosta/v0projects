import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = { title: "Necessidades" };

export default function NecessidadesPage() {
  return <ModulePlaceholder moduleKey="necessidades" />;
}
