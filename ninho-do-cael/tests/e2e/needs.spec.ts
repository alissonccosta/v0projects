import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

/**
 * Fluxo autenticado de necessidades (SDD, seções 16 e 35).
 *
 * Ativa automaticamente quando as três variáveis do Supabase existirem no
 * ambiente do e2e. Cria um usuário de teste via admin API, entra pelo link
 * mágico gerado (sem e-mail real), faz o onboarding e percorre:
 * criar → buscar/filtrar → ação rápida → arquivar. Limpa tudo ao final.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const configured = Boolean(supabaseUrl && publishableKey && serviceRoleKey);

test.describe.serial("necessidades (fluxo real com Supabase)", () => {
  test.skip(
    !configured,
    "requer NEXT_PUBLIC_SUPABASE_* e SUPABASE_SERVICE_ROLE_KEY no ambiente",
  );

  const email = `e2e.necessidades+${Date.now()}@ninho.local`;
  let userId: string;

  test.afterAll(async () => {
    if (!configured || !userId) return;
    const admin = createClient(supabaseUrl!, serviceRoleKey!);
    // Remove o household criado no onboarding (cascata leva os dados junto).
    const { data: profile } = await admin
      .from("profiles")
      .select("household_id")
      .eq("id", userId)
      .maybeSingle();
    if (profile?.household_id) {
      await admin.from("households").delete().eq("id", profile.household_id);
    }
    await admin.auth.admin.deleteUser(userId);
  });

  test("login por link, onboarding e ciclo completo da necessidade", async ({
    page,
    baseURL,
  }) => {
    const admin = createClient(supabaseUrl!, serviceRoleKey!);

    const created = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    expect(created.error).toBeNull();
    userId = created.data.user!.id;

    const link = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${baseURL}/auth/confirm` },
    });
    expect(link.error).toBeNull();

    // Entra pelo link mágico (sem caixa de e-mail).
    await page.goto(link.data.properties!.action_link);
    await expect(page).toHaveURL(/\/onboarding$/);

    // Onboarding com os dados do Cael pré-preenchidos.
    await page.getByLabel(/Seu nome/).fill("E2E");
    await page.getByRole("button", { name: "Criar o Ninho" }).click();
    await expect(page).toHaveURL(/\/app\/dashboard$/);

    // Sessão persiste após refresh (gate da Fase 2).
    await page.reload();
    await expect(page).toHaveURL(/\/app\/dashboard$/);

    // Criar necessidade.
    await page.goto("/app/necessidades/nova");
    await page.getByLabel(/Título/).fill("Térmometro de banho");
    await page.getByLabel("Categoria").selectOption("higiene");
    await page.getByLabel("Criticidade").selectOption("alta");
    await page.getByLabel("Quantidade necessária").fill("1");
    await page.getByRole("button", { name: "Criar necessidade" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Térmometro de banho" }),
    ).toBeVisible();

    // Busca ignora acento (seção 16).
    await page.goto("/app/necessidades");
    await page.getByLabel("Buscar necessidades").fill("termometro");
    await expect(page.getByText("Térmometro de banho")).toBeVisible();
    await expect(page).toHaveURL(/q=termometro/);

    // Ação rápida persiste e aparece no histórico.
    await page.getByText("Térmometro de banho").click();
    await page.getByRole("button", { name: "Marcar comprada" }).click();
    await expect(page.getByText("Marcada como comprada.")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Comprado", { exact: true })).toBeVisible();
    await expect(page.getByText(/atualizou/)).toBeVisible();

    // Arquivar com confirmação e restaurar.
    await page.getByRole("button", { name: "Arquivar" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Arquivar", exact: true })
      .click();
    await expect(page.getByText("Necessidade arquivada.")).toBeVisible();
    await page.getByRole("button", { name: "Restaurar" }).click();
    await expect(page.getByText("Necessidade restaurada.")).toBeVisible();

    // ------------------------------------------------------------------
    // Fase 4 — cadeia compra → entrega → estoque → prontidão (gate)
    // ------------------------------------------------------------------

    // Produto vinculado à necessidade.
    await page.goto("/app/produtos");
    await page.getByRole("button", { name: "Novo produto" }).click();
    const productDialog = page.getByRole("dialog", { name: "Novo produto" });
    await productDialog
      .getByLabel("Nome", { exact: true })
      .fill("Termômetro ProBaby");
    await productDialog.getByLabel("Necessidade").selectOption({
      label: "Térmometro de banho",
    });
    await productDialog
      .getByLabel("Produto preferido para a necessidade")
      .check();
    await productDialog.getByRole("button", { name: "Salvar produto" }).click();
    await expect(page.getByText("Termômetro ProBaby")).toBeVisible();

    // Compra com desconto e frete, item vinculado à necessidade.
    await page.goto("/app/compras/nova");
    await page
      .getByLabel("Título", { exact: true })
      .fill("Compra do termômetro");
    await page.getByLabel("Descrição").fill("Térmometro de banho");
    await page.getByLabel("Valor unit. (R$)").fill("49.90");
    await page.getByLabel("Necessidade").selectOption({
      label: "Térmometro de banho",
    });
    await page.getByLabel("Desconto (R$)").fill("5");
    await page.getByLabel("Frete (R$)").fill("10");
    await expect(page.getByText("Total R$ 54,90")).toBeVisible();
    await page.getByRole("button", { name: "Registrar compra" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Compra do termômetro" }),
    ).toBeVisible();
    await expect(page.getByText("Confirmada")).toBeVisible();

    // Enviada → entrega com preparo "precisa lavar".
    await page.getByRole("button", { name: "Marcar enviada" }).click();
    await expect(page.getByText("Marcada como enviada.")).toBeVisible();
    await page.getByRole("button", { name: "Confirmar entrega" }).click();
    const deliveryDialog = page.getByRole("dialog", {
      name: "Confirmar entrega",
    });
    await deliveryDialog
      .getByLabel("Onde vai ficar")
      .fill("Gaveta do trocador");
    await deliveryDialog
      .getByLabel("Preparo necessário")
      .selectOption("precisa_lavar");
    await deliveryDialog
      .getByRole("button", { name: "Confirmar entrega" })
      .click();
    await expect(
      page.getByText("Entrega confirmada. Estoque e necessidades atualizados."),
    ).toBeVisible();
    await expect(page.getByText("Entregue", { exact: true })).toBeVisible();

    // Estoque criado com o preparo indicado; lote marca como pronto.
    await page.goto("/app/estoque");
    await expect(page.getByText("Térmometro de banho")).toBeVisible();
    await expect(page.getByText("Precisa lavar").first()).toBeVisible();
    await page.getByLabel("Selecionar Térmometro de banho").check();
    await page.getByLabel("Nova prontidão").selectOption("pronto_para_uso");
    await page.getByRole("button", { name: "Aplicar" }).click();
    await expect(page.getByText("Prontidão atualizada.")).toBeVisible();

    // A necessidade reflete a cadeia: entregue, quantidade e pronta para uso.
    await page.goto("/app/necessidades");
    await page.getByLabel("Buscar necessidades").fill("termometro");
    await page.getByText("Térmometro de banho").click();
    await expect(page.getByText("Pronto para uso").first()).toBeVisible();
    await expect(page.getByText("Entregue", { exact: true })).toBeVisible();
    await expect(page.getByText("1/1")).toBeVisible();

    // Devolução parcial com impacto financeiro registrado.
    await page.goto("/app/compras");
    await page.getByText("Compra do termômetro").click();
    await page.getByRole("button", { name: "Registrar devolução" }).click();
    const returnDialog = page.getByRole("dialog", {
      name: "Registrar devolução",
    });
    await returnDialog.getByLabel("Valor devolvido (R$)").fill("10");
    await returnDialog.getByLabel("Motivo").fill("Tampa veio riscada");
    await returnDialog
      .getByRole("button", { name: "Registrar devolução" })
      .click();
    await expect(page.getByText("Devolução registrada.")).toBeVisible();
    await expect(page.getByText(/devolvido/i).first()).toBeVisible();
  });
});
