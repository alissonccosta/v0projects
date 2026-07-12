import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = { title: "Produtos" };

export default function ProdutosPage() {
  return <ModulePlaceholder moduleKey="produtos" />;
}
