import type { Metadata } from "next";
import Script from "next/script";
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
      <body className="capl-textura-papel">
        {children}
        {/* Medición anónima de uso (S07): solo si está aprobada y encendida al construir (las páginas estáticas se generan en el build). El script se excluye solo en /ingresar y el panel. */}
        {process.env.MEDICION === "si" && (
          <Script src="/medir.js" strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
