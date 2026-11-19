"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Calendar,
  Users,
  Sparkles,
  CalendarOff,
  Settings,
  Clock,
  User,
  KeyRound,
  Menu,
  X,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { EnlaceNav } from "./enlace-nav";

export type RolPanel = "ADMIN" | "PSICOLOGO";

interface BarraLateralProps {
  rol: RolPanel;
  usuarioNombre?: string;
}

export function BarraLateral({
  rol,
  usuarioNombre = "Usuario",
}: BarraLateralProps) {
  const [abiertoMovil, setAbiertoMovil] = useState(false);

  const enlacesAdmin = [
    { href: "/panel/admin/citas", label: "Citas", icono: CalendarCheck },
    { href: "/panel/admin/calendario", label: "Calendario", icono: Calendar },
    { href: "/panel/admin/psicologos", label: "Psicólogos", icono: Users },
    { href: "/panel/admin/eventos", label: "Eventos", icono: Sparkles },
    {
      href: "/panel/admin/bloqueos",
      label: "Fechas bloqueadas",
      icono: CalendarOff,
    },
    {
      href: "/panel/admin/configuracion",
      label: "Configuración",
      icono: Settings,
    },
  ];

  const enlacesPsicologo = [
    {
      href: "/panel/psicologo/citas",
      label: "Mis citas",
      icono: CalendarCheck,
    },
    { href: "/panel/psicologo/horario", label: "Mi horario", icono: Clock },
    { href: "/panel/psicologo/perfil", label: "Mi perfil", icono: User },
    { href: "/panel/psicologo/cuenta", label: "Mi cuenta", icono: KeyRound },
  ];

  const enlaces = rol === "ADMIN" ? enlacesAdmin : enlacesPsicologo;

  return (
    <>
      {/* Botón flotante para móviles */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          onClick={() => setAbiertoMovil(!abiertoMovil)}
          className="p-2 rounded-m bg-fondo-superficie border border-borde-suave text-texto-principal shadow-flotante hover:bg-fondo-suave focus-visible:outline-2 focus-visible:outline-morado-600"
          aria-label={
            abiertoMovil ? "Cerrar menú lateral" : "Abrir menú lateral"
          }
          aria-expanded={abiertoMovil}
        >
          {abiertoMovil ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Fondo oscuro para móvil */}
      {abiertoMovil && (
        <div
          className="lg:hidden fixed inset-0 bg-morado-900/40 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setAbiertoMovil(false)}
          aria-hidden="true"
        />
      )}

      {/* Barra lateral fija */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-[260px] bg-fondo-superficie border-r border-borde-suave flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          abiertoMovil ? "translate-x-0 shadow-flotante" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto p-4">
          {/* Logo y Encabezado del Panel */}
          <div className="pb-5 pt-2 border-b border-borde-suave">
            <Link
              href="/"
              className="flex items-center gap-3 group focus-visible:outline-hidden"
            >
              <div className="w-10 h-10 rounded-m bg-accion-fondo text-accion-texto flex items-center justify-center font-weight-fuerte text-h2 shadow-xs group-hover:scale-105 transition-transform">
                C
              </div>
              <div className="flex flex-col">
                <span className="font-weight-fuerte text-texto-titulo tracking-tight text-h2">
                  CAPL
                </span>
                <span className="text-caption text-texto-secundario leading-tight">
                  Centro de Atención Psicológica
                </span>
              </div>
            </Link>

            {/* Rol activo */}
            <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-pildora bg-fondo-suave border border-borde-suave text-caption text-texto-secundario">
              {rol === "ADMIN" ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-morado-600" />
                  <span className="font-weight-medio text-texto-titulo">
                    Administración
                  </span>
                </>
              ) : (
                <>
                  <HeartHandshake className="w-4 h-4 text-agua-700" />
                  <span className="font-weight-medio text-texto-titulo">
                    Psicólogo(a)
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Navegación */}
          <nav
            className="mt-5 flex-1 space-y-1.5"
            aria-label="Navegación del panel"
          >
            <div className="px-3 pb-2 text-caption font-weight-medio uppercase tracking-wider text-texto-secundario/70">
              {rol === "ADMIN" ? "Gestión del Centro" : "Mi Espacio"}
            </div>
            {enlaces.map((item) => (
              <EnlaceNav
                key={item.href}
                href={item.href}
                label={item.label}
                icono={item.icono}
                onClick={() => setAbiertoMovil(false)}
              />
            ))}
          </nav>
        </div>

        {/* Pie de barra lateral con información del usuario */}
        <div className="p-4 border-t border-borde-suave bg-fondo-suave/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-circulo bg-morado-100 text-morado-700 flex items-center justify-center font-weight-fuerte text-caption border border-morado-300">
              {usuarioNombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-caption font-weight-medio text-texto-titulo truncate">
                {usuarioNombre}
              </span>
              <span className="text-caption text-texto-secundario truncate text-[11px]">
                {rol === "ADMIN" ? "Coordinación" : "Atención clínica"}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
