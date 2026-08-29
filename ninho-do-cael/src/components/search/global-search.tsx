"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { groupSearchResults, type SearchResult } from "@/lib/search/model";

/**
 * Pesquisa global (SDD, seção 24): atalho "/" no desktop, cinco entidades,
 * sem acento e com título priorizado. A busca acontece em /api/search — o
 * diálogo só orquestra digitação, debounce e navegação.
 */
export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "done" | "error"
  >("idle");

  // Atalho "/" abre a busca quando o foco não está num campo de texto.
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }
      event.preventDefault();
      setOpen(true);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Debounce + cancelamento de respostas atrasadas. Todo setState roda
  // dentro do timer (nunca síncrono no effect — regra do React Compiler).
  React.useEffect(() => {
    if (!open) return;
    const term = query.trim();
    const controller = new AbortController();
    const timer = setTimeout(
      async () => {
        if (term.length === 0) {
          setResults([]);
          setStatus("idle");
          return;
        }
        setStatus("loading");
        try {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(term)}`,
            { signal: controller.signal },
          );
          const payload = (await response.json()) as
            | { ok: true; data: SearchResult[] }
            | { ok: false; error: { message: string } };
          if (payload.ok) {
            setResults(payload.data);
            setStatus("done");
          } else {
            setResults([]);
            setStatus("error");
          }
        } catch (error) {
          if ((error as Error).name !== "AbortError") {
            setResults([]);
            setStatus("error");
          }
        }
      },
      term.length === 0 ? 0 : 250,
    );
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [open, query]);

  function close() {
    setOpen(false);
    setQuery("");
    setResults([]);
    setStatus("idle");
  }

  const groups = groupSearchResults(results);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : close())}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-1.5 max-lg:size-11 max-lg:p-0"
          aria-label="Pesquisar"
        >
          <MagnifyingGlassIcon size={18} aria-hidden="true" />
          <span className="hidden lg:inline">Pesquisar</span>
          <kbd
            aria-hidden="true"
            className="hidden rounded-sm border border-sand bg-canvas px-1.5 text-xs text-text-secondary lg:inline"
          >
            /
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="top-24 translate-y-0 gap-3">
        <DialogHeader>
          <DialogTitle>Pesquisar</DialogTitle>
          <DialogDescription>
            Necessidades, produtos, compras, tarefas e decisões — sem se
            preocupar com acentos.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="busca-global" className="sr-only">
            Termo de busca
          </Label>
          <Input
            id="busca-global"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex.: berço, fralda, obstetra…"
            autoFocus
            autoComplete="off"
          />
        </div>

        {status === "idle" ? (
          <p className="text-sm text-text-secondary">
            Digite para buscar. Dica: no computador, a tecla{" "}
            <kbd className="rounded-sm border border-sand bg-canvas px-1 text-xs">
              /
            </kbd>{" "}
            abre esta busca de qualquer tela.
          </p>
        ) : null}
        {status === "loading" ? (
          <p className="text-sm text-text-secondary" aria-live="polite">
            Buscando…
          </p>
        ) : null}
        {status === "error" ? (
          <p role="alert" className="text-sm text-danger-strong">
            Não foi possível buscar agora. Tente novamente.
          </p>
        ) : null}
        {status === "done" && results.length === 0 ? (
          <p className="text-sm text-text-secondary" aria-live="polite">
            Nada encontrado para “{query.trim()}”.
          </p>
        ) : null}

        {groups.length > 0 ? (
          <div
            className="flex max-h-80 flex-col gap-3 overflow-y-auto"
            aria-live="polite"
          >
            {groups.map((group) => (
              <section key={group.entity} className="flex flex-col gap-1">
                <h3 className="text-xs font-semibold tracking-wide text-text-secondary uppercase">
                  {group.label}
                </h3>
                <ul className="flex flex-col">
                  {group.items.map((result) => (
                    <li key={`${result.entity}:${result.id}`}>
                      <Link
                        href={result.href}
                        onClick={close}
                        className="flex min-h-11 flex-col justify-center rounded-md px-2 outline-none hover:bg-canvas focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="text-sm font-medium text-forest-900">
                          {result.title}
                        </span>
                        {result.subtitle ? (
                          <span className="text-xs text-text-secondary">
                            {result.subtitle}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
