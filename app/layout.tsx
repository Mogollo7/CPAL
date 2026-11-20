import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// next/font descarga las fuentes al construir y las sirve desde el propio sitio (CSP font-src 'self').
const fuenteTitulo = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "800"], // N03: 400 texto · 600 énfasis y botones · 800 títulos
  variable: "--fuente-titulo",
});

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
    <html lang="es" className={fuenteTitulo.variable}>
      <body>
        {children}
        {/* Medición anónima de uso (S07): solo si está aprobada y encendida al construir (las páginas estáticas se generan en el build). El script se excluye solo en /ingresar y el panel. */}
        {process.env.MEDICION === "si" && (
          <Script src="/medir.js" strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
