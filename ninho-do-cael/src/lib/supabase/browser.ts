"use client";

import { createBrowserClient } from "@supabase/ssr";

import { supabasePublishableKey, supabaseUrl } from "./config";

/** Client Supabase para Client Components (somente chaves públicas). */
export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase não configurado.");
  }
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
