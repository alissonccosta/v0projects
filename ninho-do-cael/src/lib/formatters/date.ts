import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/** Formata "2026-11-15" como "15/11/2026". */
export function formatDateBR(isoDate: string): string {
  return format(parseISO(isoDate), "dd/MM/yyyy", { locale: ptBR });
}

/** Formata "2026-11-15" como "15 de novembro de 2026". */
export function formatDateLongBR(isoDate: string): string {
  return format(parseISO(isoDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}
