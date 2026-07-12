import { EnvelopeOpenIcon } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";

import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionInfo } from "@/lib/auth/session";

import { AcceptInviteForm } from "./accept-invite-form";

export const metadata: Metadata = { title: "Convite" };

export default async function ConvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!z.uuid().safeParse(token).success) {
    return (
      <EmptyState
        icon={EnvelopeOpenIcon}
        title="Convite inválido"
        description="Este link de convite não é válido. Peça um novo link para quem administra o Ninho."
      />
    );
  }

  const session = await getSessionInfo();

  if (session.mode === "demo" || session.mode === "unauthenticated") {
    redirect(`/login?next=${encodeURIComponent(`/convite/${token}`)}`);
  }

  if (session.mode === "member") {
    return (
      <EmptyState
        icon={EnvelopeOpenIcon}
        title="Você já faz parte de uma família"
        description={`Sua conta já está vinculada a "${session.householdName}". Cada conta participa de uma única família no momento.`}
        action={
          <Link href="/app/dashboard" className={buttonVariants()}>
            Ir para o painel
          </Link>
        }
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">
          Você foi convidada
        </CardTitle>
        <CardDescription>
          Informe seu nome para entrar na família e acompanhar o enxoval do Cael
          junto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AcceptInviteForm token={token} />
      </CardContent>
    </Card>
  );
}
