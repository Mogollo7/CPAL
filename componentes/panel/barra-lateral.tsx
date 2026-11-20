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
  ClipboardList,
  ShieldCheck,
  MailWarning,
  Clock,
  User,
  Menu,
  X,
} from "lucide-react";
import { LogoCapl } from "@/componentes/atomos/logo-capl";
import { CabeceraPanel } from "./cabecera-panel";
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
    {
      href: "/panel/admin/servicios",
      label: "Servicios",
      icono: ClipboardList,
    },
    {
      href: "/panel/admin/administradores",
      label: "Administradores",
      icono: ShieldCheck,
    },
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
    {
      href: "/panel/admin/correos",
      label: "Correos fallidos",
      icono: MailWarning,
    },
    { href: "/panel/admin/cuenta", label: "Mi cuenta", icono: User },
  ];

  const enlacesPsicologo = [
    {
      href: "/panel/psicologo/citas",
      label: "Mis citas",
      icono: CalendarCheck,
    },
    { href: "/panel/psicologo/pacientes", label: "Pacientes", icono: Users },
    {
      href: "/panel/psicologo/horario",
      label: "Horario habitual",
      icono: Clock,
    },
    { href: "/panel/psicologo/perfil", label: "Perfil y cuenta", icono: User },
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
            <X className="w-[24px] h-[24px]" />
          ) : (
            <Menu className="w-[24px] h-[24px]" />
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
        className={`fixed top-0 bottom-0 left-0 z-40 w-[260px] bg-fondo-superficie border border-borde-suave rounded-m flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          abiertoMovil ? "translate-x-0 shadow-flotante" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto p-4">
          <div className="px-3 pt-2">
            <Link href="/" className="inline-block">
              <LogoCapl />
            </Link>
            <p className="text-caption font-medio text-texto-secundario">
              Panel {rol === "ADMIN" ? "de administración" : "del psicólogo"}
            </p>
          </div>
          <nav className="mt-5 flex-1" aria-label="Navegación del panel">
            {enlaces.map((item, index) => (
              <div key={item.href}>
                {(index === 0 ||
                  (rol === "PSICOLOGO" && (index === 1 || index === 2))) && (
                  <p className="px-3 pt-4 pb-2 text-caption font-medio text-texto-secundario">
                    {rol === "ADMIN"
                      ? "Gestión del centro"
                      : index === 0
                        ? "Agenda"
                        : index === 1
                          ? "Disponibilidad"
                          : "Mi espacio"}
                  </p>
                )}
                <EnlaceNav
                  href={item.href}
                  label={item.label}
                  icono={item.icono}
                  onClick={() => setAbiertoMovil(false)}
                />
              </div>
            ))}
          </nav>
        </div>
        <div className="m-4 rounded-m bg-fondo-suave p-3 flex items-center gap-3">
          <div className="w-[44px] h-[44px] rounded-circulo bg-fondo-seccion text-texto-enlace flex items-center justify-center font-fuerte text-caption">
            {usuarioNombre.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="block text-caption font-medio truncate">
              {usuarioNombre}
            </span>
            <CabeceraPanel usuarioNombre={usuarioNombre} rol={rol} compacto />
          </div>
        </div>
      </aside>
    </>
  );
}
