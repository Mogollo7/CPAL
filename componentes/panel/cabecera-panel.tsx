"use client";

import { useTransition } from "react";
import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import { cn } from "@/componentes/cn";
import { cerrarSesionAccion } from "@/servidor/cuentas/acciones";

interface CabeceraPanelProps {
  usuarioNombre?: string;
  rol: "ADMIN" | "PSICOLOGO";
  compacto?: boolean;
  className?: string;
}

export function CabeceraPanel({
  usuarioNombre = "Usuario",
  rol,
  compacto,
  className,
}: CabeceraPanelProps) {
  const [pendiente, iniciarTransicion] = useTransition();

  const manejarCerrarSesion = () => {
    iniciarTransicion(async () => {
      await cerrarSesionAccion();
    });
  };

  const salir = (
    <button
      type="button"
      onClick={manejarCerrarSesion}
      disabled={pendiente}
      className="inline-flex min-h-[44px] max-w-full items-center gap-2 rounded-s px-2 text-caption font-fuerte text-error-texto hover:bg-error-fondo disabled:opacity-50"
    >
      <LogOut className="size-4 shrink-0" aria-hidden="true" />
      {pendiente ? "Cerrando…" : "Cerrar sesión"}
    </button>
  );

  if (compacto) return salir;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-[64px] flex-wrap items-center justify-between gap-3 border-b border-borde-suave bg-fondo-superficie px-borde py-2",
        className,
      )}
    >
      <p className="text-h2 font-fuerte text-texto-titulo">
        Panel de {rol === "ADMIN" ? "Administración" : "Psicología"}
      </p>

      <div className="flex items-center gap-4">
        {/* Acceso rápido al sitio público */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-[6px] text-caption font-weight-medio text-texto-secundario hover:text-texto-enlace transition-colors px-3 py-[6px] rounded-m hover:bg-fondo-suave border border-transparent hover:border-borde-suave"
          title="Abrir sitio web público en una nueva pestaña"
        >
          <span>Sitio público</span>
          <ExternalLink className="w-[14px] h-[14px]" />
        </Link>

        {/* Separador */}
        <div className="hidden sm:block h-5 w-px bg-borde-suave" />

        {/* Estado y perfil */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-caption font-weight-medio text-texto-principal leading-tight">
              {usuarioNombre}
            </span>
            <span className="text-caption text-agua-700 font-weight-medio flex items-center gap-1 justify-end">
              <span
                className="size-[6px] rounded-circulo bg-agua-500"
                aria-hidden="true"
              />
              Sesión activa
            </span>
          </div>

          {salir}
        </div>
      </div>
    </header>
  );
}
