const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata 1259.1 como "R$ 1.259,10". */
export function formatBRL(value: number): string {
  return brl.format(value);
}
