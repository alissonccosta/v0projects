import { redirect } from "next/navigation";

/**
 * A raiz leva ao painel. Quando a autenticação chegar (Fase 2), rotas
 * protegidas redirecionam para /login antes.
 */
export default function RootPage() {
  redirect("/app/dashboard");
}
