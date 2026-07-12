import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr";
import * as React from "react";

import { cn } from "@/lib/utils";

/** Select nativo tematizado: acessível por padrão e confortável no toque. */
function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <span className={cn("relative block", className)}>
      <select
        data-slot="select"
        className={cn(
          "h-11 w-full appearance-none rounded-md border border-input bg-surface px-3 pr-9 text-base text-foreground transition-colors duration-150 outline-none focus-visible:border-sage-500 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm",
          "aria-invalid:border-danger",
        )}
        {...props}
      >
        {children}
      </select>
      <CaretDownIcon
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-text-secondary"
      />
    </span>
  );
}

export { Select };
