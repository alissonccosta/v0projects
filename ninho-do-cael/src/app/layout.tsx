import type { Metadata } from "next";

import "@fontsource-variable/manrope";
import "@fontsource-variable/fraunces";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Ninho do Cael",
    template: "%s · Ninho do Cael",
  },
  description: "Gestão do enxoval e da preparação para a chegada do Cael.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
