"use client";

import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "@phosphor-icons/react/dist/ssr";
import * as React from "react";

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-forest-900/40 duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

const sheetSides = {
  bottom:
    "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom pb-[max(env(safe-area-inset-bottom),theme(spacing.4))]",
  right:
    "inset-y-0 right-0 h-full w-full max-w-[min(90vw,32rem)] border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
  left: "inset-y-0 left-0 h-full w-full max-w-[min(90vw,32rem)] border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
} as const;

function SheetContent({
  className,
  children,
  side = "bottom",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: keyof typeof sheetSides;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col gap-4 overflow-y-auto border-sand bg-card p-6 text-card-foreground shadow-[0_-8px_30px_rgba(41,53,44,0.12)] duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
          sheetSides[side],
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute top-3 right-3 flex size-11 cursor-pointer items-center justify-center rounded-md text-text-secondary transition-colors duration-150 outline-none hover:bg-secondary/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          <XIcon size={20} aria-hidden="true" />
          <span className="sr-only">Fechar</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 pr-10 text-left", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-lg leading-snug font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
};
