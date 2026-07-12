import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionInfo } from "@/lib/auth/session";

import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Começar" };

export default async function OnboardingPage() {
  const session = await getSessionInfo();

  if (session.mode === "demo" || session.mode === "unauthenticated") {
    redirect("/login");
  }
  if (session.mode === "member") {
    redirect("/app/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">
          Vamos preparar o Ninho
        </CardTitle>
        <CardDescription>
          Confirme os dados da família e do bebê. Tudo pode ser ajustado depois
          em Configurações.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OnboardingForm />
      </CardContent>
    </Card>
  );
}
