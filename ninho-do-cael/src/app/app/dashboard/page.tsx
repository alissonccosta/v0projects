import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = { title: "Início" };

export default function DashboardPage() {
  return <ModulePlaceholder moduleKey="dashboard" />;
}
