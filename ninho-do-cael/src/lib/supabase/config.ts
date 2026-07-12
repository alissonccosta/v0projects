/**
 * Presença da configuração pública do Supabase.
 *
 * Referências diretas a process.env.NEXT_PUBLIC_* (o Next as embute no
 * build). Enquanto o projeto Supabase não estiver configurado, o app roda em
 * modo demonstração local: sem autenticação, com aviso visível — nunca
 * fingindo login (SDD, seções 0.1 e 46).
 */

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabasePublishableKey);
}
