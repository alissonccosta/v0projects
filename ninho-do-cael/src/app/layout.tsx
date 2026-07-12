import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ninho do Cael",
  description: "Gestão do enxoval e da preparação para a chegada do Cael.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
