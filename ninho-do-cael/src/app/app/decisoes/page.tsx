import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = { title: "Decisões" };

export default function DecisoesPage() {
  return <ModulePlaceholder moduleKey="decisoes" />;
}
