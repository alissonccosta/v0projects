import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = { title: "Estoque" };

export default function EstoquePage() {
  return <ModulePlaceholder moduleKey="estoque" />;
}
