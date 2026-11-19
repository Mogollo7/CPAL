import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const instant = false;

export default function LayoutAcceso({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-fondo-pagina flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Barra superior con volver al inicio */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-caption font-weight-medio text-texto-secundario hover:text-texto-titulo transition-colors p-2 rounded-m hover:bg-fondo-suave focus-visible:outline-2 focus-visible:outline-morado-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al sitio web</span>
        </Link>

        <div className="flex items-center gap-1.5 text-caption text-texto-secundario">
          <Shield className="w-4 h-4 text-morado-600" />
          <span>Acceso seguro</span>
        </div>
      </div>

      {/* Contenedor central de la tarjeta */}
      <div className="my-auto py-8 flex justify-center">{children}</div>

      {/* Pie institucional */}
      <footer className="max-w-md w-full mx-auto text-center text-caption text-texto-secundario pt-6 border-t border-borde-suave/40">
        <p>Centro de Atención Psicológica — Universidad de La Salle</p>
        <p className="text-[11px] mt-1 text-texto-secundario/80">
          Uso exclusivo para personal administrativo y equipo terapéutico.
        </p>
      </footer>
    </div>
  );
}
