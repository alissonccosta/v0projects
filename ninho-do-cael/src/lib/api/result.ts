import { NextResponse } from "next/server";

/** Contrato de resposta da API interna (SDD, seção 29). */
export type ApiResult<T> =
  | { ok: true; data: T; meta?: Record<string, unknown> }
  | { ok: false; error: { code: string; message: string; details?: unknown } };

export function apiOk<T>(
  data: T,
  init?: { meta?: Record<string, unknown>; status?: number },
): NextResponse {
  const body: ApiResult<T> = {
    ok: true,
    data,
    ...(init?.meta ? { meta: init.meta } : {}),
  };
  return NextResponse.json(body, { status: init?.status ?? 200 });
}

export function apiError(
  code: string,
  message: string,
  init?: { status?: number; details?: unknown },
): NextResponse {
  const body: ApiResult<never> = {
    ok: false,
    error: {
      code,
      message,
      ...(init?.details !== undefined ? { details: init.details } : {}),
    },
  };
  return NextResponse.json(body, { status: init?.status ?? 400 });
}
