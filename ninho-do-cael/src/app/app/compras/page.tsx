import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = { title: "Compras" };

export default function ComprasPage() {
  return <ModulePlaceholder moduleKey="compras" />;
}
