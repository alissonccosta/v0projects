import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = { title: "Jornada" };

export default function JornadaPage() {
  return <ModulePlaceholder moduleKey="jornada" />;
}
