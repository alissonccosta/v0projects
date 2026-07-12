"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-lg !border !border-sand !bg-card !text-card-foreground !shadow-[0_4px_16px_rgba(41,53,44,0.1)]",
          description: "!text-text-secondary",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-secondary !text-secondary-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
