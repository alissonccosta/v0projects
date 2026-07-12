import { cn } from "@/lib/utils";

/** Marca provisória: ninho abstrato na paleta do quarto (definitiva na Fase 8). */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Ninho do Cael"
      className={cn("size-8", className)}
    >
      <rect width="64" height="64" rx="14" fill="var(--sage-100)" />
      <circle
        cx="32"
        cy="36"
        r="14"
        fill="none"
        stroke="var(--olive-600)"
        strokeWidth="5"
      />
      <circle cx="32" cy="36" r="5" fill="var(--wood)" />
      <path
        d="M32 8 C 37 12 37 17 32 21 C 27 17 27 12 32 8 Z"
        fill="var(--moss-700)"
      />
    </svg>
  );
}
