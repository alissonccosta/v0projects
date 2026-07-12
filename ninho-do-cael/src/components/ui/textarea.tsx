import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full rounded-md border border-input bg-surface px-3 py-2 text-base text-foreground transition-colors duration-150 outline-none placeholder:text-text-secondary/70 focus-visible:border-sage-500 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm",
        "aria-invalid:border-danger",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
