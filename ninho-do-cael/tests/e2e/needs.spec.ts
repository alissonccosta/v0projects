import fs from "node:fs";
import path from "node:path";

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

    // ------------------------------------------------------------------
    // Fase 5 — tarefa vinculada, bloqueio, conclusão com critério,
    // decisão médica e jornada (gate: relações e filtros por fase)
    // ------------------------------------------------------------------
    const hoje = new Date().toISOString().slice(0, 10);

    // Criar tarefa a partir do detalhe da necessidade (vínculo pré-marcado).
    await page.goto("/app/necessidades");
    await page.getByLabel("Buscar necessidades").fill("termometro");
    await page.getByText("Térmometro de banho").click();
    await page.getByRole("link", { name: "Criar tarefa" }).click();
    await expect(page).toHaveURL(/\/app\/tarefas\/nova\?necessidade=/);
    await expect(
      page.getByRole("checkbox", { name: "Térmometro de banho" }),
    ).toBeChecked();
    await page.getByLabel("Título", { exact: true }).fill("Lavar o termômetro");
    await page.getByLabel("Prazo", { exact: true }).fill(hoje);
    await page
      .getByLabel("Critério de conclusão")
      .fill("Termômetro lavado, seco e guardado");
    await page.getByRole("button", { name: "Criar tarefa" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Lavar o termômetro" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Térmometro de banho" }),
    ).toBeVisible();

    // Tarefa bloqueada com dependência e bloqueador (seção 20).
    await page.goto("/app/tarefas/nova");
    await page
      .getByLabel("Título", { exact: true })
      .fill("Guardar o termômetro");
    await page.getByLabel("Status", { exact: true }).selectOption("bloqueada");
    await page
      .getByLabel("Depende da tarefa")
      .selectOption({ label: "Lavar o termômetro" });
    await page.getByLabel("O que bloqueia").fill("Precisa estar lavado antes");
    await page.getByRole("button", { name: "Criar tarefa" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Guardar o termômetro" }),
    ).toBeVisible();
    await expect(page.getByText("Por que está bloqueada")).toBeVisible();
    await expect(page.getByText("Concluir “Lavar o termômetro”")).toBeVisible();

    // Visão Bloqueadas mostra dependência, bloqueador, ação e responsável.
    await page.goto("/app/tarefas?view=bloqueadas");
    await expect(page.getByText("Guardar o termômetro")).toBeVisible();
    await expect(page.getByText("Dependência", { exact: true })).toBeVisible();
    await expect(page.getByText("Bloqueador", { exact: true })).toBeVisible();
    await expect(page.getByText("Ação para destravar")).toBeVisible();
    await expect(page.getByText("Responsável pela ação")).toBeVisible();

    // Conclusão exige o critério confirmado (seção 20).
    await page.goto("/app/tarefas");
    await page.getByText("Lavar o termômetro", { exact: true }).click();
    await page.getByRole("button", { name: "Concluir", exact: true }).click();
    const completeDialog = page.getByRole("dialog", {
      name: "Concluir tarefa",
    });
    await expect(
      completeDialog.getByText("Termômetro lavado, seco e guardado"),
    ).toBeVisible();
    await completeDialog
      .getByRole("button", { name: "Concluir tarefa" })
      .click();
    await expect(
      completeDialog.getByText(/Confirme que o critério/),
    ).toBeVisible();
    await completeDialog
      .getByRole("checkbox", { name: /critério acima foi atendido/ })
      .check();
    await completeDialog
      .getByLabel("Nota (opcional)")
      .fill("Lavado com sabão neutro");
    await completeDialog
      .getByRole("button", { name: "Concluir tarefa" })
      .click();
    await expect(
      page.getByText("Tarefa concluída. Bom trabalho!"),
    ).toBeVisible();
    await expect(page.getByText("Concluída", { exact: true })).toBeVisible();

    // A bloqueada agora aponta que a dependência foi concluída.
    await page.goto("/app/tarefas?view=bloqueadas");
    await expect(
      page.getByText("Dependência concluída — retome a tarefa"),
    ).toBeVisible();

    // Decisão médica a partir da necessidade: aviso permanente + fluxo Decidir.
    await page.goto("/app/necessidades");
    await page.getByLabel("Buscar necessidades").fill("termometro");
    await page.getByText("Térmometro de banho").click();
    await page.getByRole("link", { name: "Criar decisão" }).click();
    await expect(page).toHaveURL(/\/app\/decisoes\/nova\?necessidade=/);
    await page
      .getByLabel("Título", { exact: true })
      .fill("Qual termômetro o pediatra recomenda?");
    await page.getByLabel("Tipo", { exact: true }).selectOption("medica");
    await expect(
      page.getByText(
        /nunca há conclusão automática|vem sempre de profissional/,
      ),
    ).toBeVisible();
    await page
      .getByLabel("Status", { exact: true })
      .selectOption("aguardando_profissional");
    await page.getByRole("button", { name: "Registrar decisão" }).click();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Qual termômetro o pediatra recomenda?",
      }),
    ).toBeVisible();
    await expect(page.getByText(/vem sempre de profissional/)).toBeVisible();

    // Está no grupo "Aguardando profissional" da lista.
    await page.goto("/app/decisoes");
    await expect(page.getByText("Aguardando profissional · 1")).toBeVisible();

    // Decidir: conclusão obrigatória + confirmação profissional (10.11).
    await page.getByText("Qual termômetro o pediatra recomenda?").click();
    await page.getByRole("button", { name: "Decidir" }).click();
    const decideDialog = page.getByRole("dialog", {
      name: "Registrar a decisão",
    });
    await decideDialog
      .getByLabel("Conclusão")
      .fill("Pediatra indicou termômetro digital comum.");
    await decideDialog
      .getByRole("button", { name: "Registrar decisão" })
      .click();
    await expect(
      decideDialog.getByText(/confirme que a conclusão veio de profissional/i),
    ).toBeVisible();
    await decideDialog
      .getByRole("checkbox", { name: /profissional que acompanha/ })
      .check();
    await decideDialog
      .getByRole("button", { name: "Registrar decisão" })
      .click();
    await expect(page.getByText("Decisão registrada.")).toBeVisible();
    await page.goto("/app/decisoes");
    await expect(page.getByText("Decididas · 1")).toBeVisible();

    // Relações no detalhe da necessidade (gate: necessidade↔tarefa↔decisão).
    await page.goto("/app/necessidades");
    await page.getByLabel("Buscar necessidades").fill("termometro");
    await page.getByText("Térmometro de banho").click();
    await expect(
      page.getByRole("link", { name: "Lavar o termômetro" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: "Qual termômetro o pediatra recomenda?",
      }),
    ).toBeVisible();

    // Jornada: gasto da fase, filtro por fase e itens futuros (seção 22).
    await page.goto("/app/jornada");
    await expect(
      page.getByRole("heading", { level: 1, name: "Jornada" }),
    ).toBeVisible();
    await expect(page.getByText("Antes do parto")).toBeVisible();
    await expect(page.getByText("R$ 44,90")).toBeVisible();
    await expect(page.getByText("Fase futura").first()).toBeVisible();
    await page.getByRole("link", { name: "Mostrar itens futuros" }).click();
    await expect(page).toHaveURL(/futuros=1/);
    await expect(
      page.getByRole("link", { name: "Ocultar itens futuros" }),
    ).toBeVisible();

    // Filtro por fase leva às necessidades corretas.
    await page.getByRole("link", { name: "Ver da fase" }).first().click();
    await expect(page).toHaveURL(/fase=antes_do_parto/);
    await expect(page.getByText("Térmometro de banho")).toBeVisible();

    // Evidências visuais da fase 5 com dados reais.
    const fase5Dir = path.join(__dirname, "..", "..", "docs", "qa", "fase-5");
    fs.mkdirSync(fase5Dir, { recursive: true });
    await page.goto("/app/tarefas");
    await page.screenshot({
      path: path.join(fase5Dir, "tarefas-real.png"),
      fullPage: true,
    });
    await page.goto("/app/decisoes");
    await page.screenshot({
      path: path.join(fase5Dir, "decisoes-real.png"),
      fullPage: true,
    });
    await page.goto("/app/jornada");
    await page.screenshot({
      path: path.join(fase5Dir, "jornada-real.png"),
      fullPage: true,
    });

    // ------------------------------------------------------------------
    // Fase 6 — painel, orçamento, atividade e busca global
    // (gate: tudo vem do banco, zero números fixos)
    // ------------------------------------------------------------------

    // Painel: contagem regressiva, prontidão, financeiro e alertas reais.
    await page.goto("/app/dashboard");
    await expect(page.getByText(/dias até a data prevista/)).toBeVisible();
    await expect(page.getByText("Prontidão geral")).toBeVisible();
    // Pago líquido da cadeia: R$ 54,90 − R$ 10,00 devolvidos.
    await expect(page.getByText("R$ 44,90").first()).toBeVisible();
    // A tarefa "Guardar o termômetro" segue bloqueada → alerta + próxima ação.
    await expect(page.getByText("1 tarefa bloqueada")).toBeVisible();
    await expect(page.getByText("Próximas ações")).toBeVisible();
    await expect(page.getByText("Guardar o termômetro").first()).toBeVisible();
    // Gráficos com resumo textual.
    await expect(page.getByText("Gastos por categoria")).toBeVisible();
    await expect(page.getByText(/Maior gasto: Higiene/)).toBeVisible();

    // Orçamento: indicadores e quebras calculados das compras.
    await page.goto("/app/orcamento");
    await expect(
      page.getByRole("heading", { level: 1, name: "Orçamento" }),
    ).toBeVisible();
    await expect(page.getByText("Comprometido", { exact: true })).toBeVisible();
    await expect(page.getByText("R$ 44,90").first()).toBeVisible();
    await expect(page.getByText("Devolvido", { exact: true })).toBeVisible();
    await expect(page.getByText("Fornecedores")).toBeVisible();

    // Atividade: quem fez o quê, com link para a entidade.
    await page.goto("/app/atividade");
    await expect(
      page.getByRole("heading", { level: 1, name: "Atividade" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Térmometro de banho" }).first(),
    ).toBeVisible();

    // Busca global (seção 24): botão, atalho "/", acento ignorado, navegação.
    await page.getByRole("button", { name: "Pesquisar" }).click();
    const searchDialog = page.getByRole("dialog", { name: "Pesquisar" });
    await expect(searchDialog).toBeVisible();
    await searchDialog.getByLabel("Termo de busca").fill("termometro");
    await expect(
      searchDialog.getByRole("link", { name: "Térmometro de banho" }),
    ).toBeVisible();
    await expect(
      searchDialog.getByRole("link", { name: "Lavar o termômetro" }),
    ).toBeVisible();
    await searchDialog
      .getByRole("link", { name: "Térmometro de banho" })
      .click();
    await expect(page).toHaveURL(/\/app\/necessidades\//);
    await expect(searchDialog).not.toBeVisible();
    // Atalho "/" reabre a busca.
    await page.keyboard.press("/");
    await expect(page.getByRole("dialog", { name: "Pesquisar" })).toBeVisible();
    await page.keyboard.press("Escape");

    // Evidências visuais da fase 6 com dados reais.
    const fase6Dir = path.join(__dirname, "..", "..", "docs", "qa", "fase-6");
    fs.mkdirSync(fase6Dir, { recursive: true });
    await page.goto("/app/dashboard");
    await page.screenshot({
      path: path.join(fase6Dir, "dashboard-real.png"),
      fullPage: true,
    });
    await page.goto("/app/orcamento");
    await page.screenshot({
      path: path.join(fase6Dir, "orcamento-real.png"),
      fullPage: true,
    });
  });
});
