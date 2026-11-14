import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAPL",
  description: "Centro de Atención Psicológica La Salle",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
