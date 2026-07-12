import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "border-sand bg-sand-soft text-text-primary",
        sage: "border-sage-300 bg-sage-soft text-moss-700",
        success: "border-success/30 bg-success-soft text-success-strong",
        warning: "border-warning/30 bg-warning-soft text-warning-strong",
        danger: "border-danger/30 bg-danger-soft text-danger-strong",
        info: "border-info/30 bg-info-soft text-info-strong",
        outline: "border-sand bg-transparent text-text-secondary",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

function Badge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ tone, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
