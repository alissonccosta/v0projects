import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { decideRouteAccess } from "@/lib/auth/route-guard";
import {
  isSupabaseConfigured,
  supabasePublishableKey,
  supabaseUrl,
} from "@/lib/supabase/config";

/**
 * Proxy do Next 16 (sucessor do middleware): renova a sessão do Supabase a
 * cada requisição e aplica a guarda de rotas (SDD, seção 27).
 */
export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    // Modo demonstração local: sem autenticação, com aviso visível na UI.
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl!, supabasePublishableKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() valida a sessão junto ao servidor de auth e renova os cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const decision = decideRouteAccess({
    configured: true,
    authenticated: Boolean(user),
    pathname: request.nextUrl.pathname,
  });

  if (decision.action === "redirect") {
    const url = request.nextUrl.clone();
    const [pathname, query] = decision.to.split("?");
    url.pathname = pathname ?? "/login";
    url.search = query ? `?${query}` : "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/app/:path*", "/login", "/onboarding", "/convite/:path*"],
};
