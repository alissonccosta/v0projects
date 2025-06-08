# Identidade Visual e Paleta de Cores

A plataforma utiliza um design moderno, clean e visualmente atrativo. As interfaces sao construidas com TailwindCSS customizado conforme a seguinte paleta de cores:

## Cores Base
- **Primaria:** `#FFFFFF` (branco)
- **Secundaria:** `#4E008E` (roxo)

## Cores para Status (Semaforo)
- **Verde:** `#00B894`
- **Amarelo:** `#FDCB6E`
- **Vermelho:** `#D63031`

## Cores de Criticidade/Prioridade
- **Emergencial:** `#D63031`
- **Muito Alta:** `#E17055`
- **Alta:** `#FDCB6E`
- **Média:** `#00B894`
- **Baixa:** `#0984E3`

## Cores para Indicadores e Insights
- **Insight Positivo:** `#00CEC9`
- **Insight Negativo:** `#D63031`
- **Insight Neutro:** `#636E72`

## Estilo Visual
- Cantos arredondados, sombras suaves e tipografia clean.
- Modo escuro disponivel: fundo `#1E1E2F` e texto `#FFFFFF`.
- Transicoes suaves em estados de hover e foco.
- Botoes primarios roxos com texto branco.
- Botoes secundarios com borda roxa, texto roxo e fundo branco.
- Graficos e dashboards seguem a mesma paleta para status e indicadores.

## Componentes de UI

O projeto disponibiliza componentes reutilizáveis em `frontend/src/components/ui`:

- `Button` – botões primário e secundário já estilizados
- `Input` – campo de texto com exibição automática de erros
- `Card` – container com título opcional
- `Modal` – janela modal com overlay escuro
- `Badge` – rótulos coloridos conforme status ou prioridade
- `Table` – tabela básica com cabeçalho roxo
