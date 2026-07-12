import * as React from "react";

import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-sm leading-none font-medium text-forest-900",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
