"use client";

import { useTransition } from "react";
import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import { cerrarSesionAccion } from "@/servidor/cuentas/acciones";

interface CabeceraPanelProps {
  usuarioNombre?: string;
  rol: "ADMIN" | "PSICOLOGO";
  compacto?: boolean;
}

export function CabeceraPanel({
  usuarioNombre = "Usuario",
  rol,
}: CabeceraPanelProps) {
  const [pendiente, iniciarTransicion] = useTransition();

  const manejarCerrarSesion = () => {
    iniciarTransicion(async () => {
      await cerrarSesionAccion();
    });
  };

  return (
    <header className="h-[64px] border-b border-borde-suave bg-fondo-superficie/90 backdrop-blur-xs sticky top-0 z-30 px-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Espaciador para no solapar el botón hamburguesa en móvil */}
        <div className="w-8 lg:hidden" />
        <div>
          <h1 className="text-h2 font-weight-fuerte text-texto-titulo tracking-tight">
            Panel de {rol === "ADMIN" ? "Administración" : "Psicología"}
          </h1>
        </div>
      </div>

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
            <span className="text-[11px] text-agua-700 font-weight-medio flex items-center gap-1 justify-end">
              <span className="w-[6px] h-[6px] rounded-circulo bg-agua-500 animate-pulse" />
              Sesión activa
            </span>
          </div>

          {/* Botón Cerrar Sesión */}
          <button
            type="button"
            onClick={manejarCerrarSesion}
            disabled={pendiente}
            className="flex items-center gap-2 px-3 py-[6px] text-caption font-weight-medio text-error-texto bg-error-fondo/40 hover:bg-error-fondo border border-error-texto/20 rounded-m transition-all focus-visible:outline-2 focus-visible:outline-morado-600 disabled:opacity-50 cursor-pointer"
            title="Cerrar sesión segura"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">
              {pendiente ? "Cerrando..." : "Salir"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
