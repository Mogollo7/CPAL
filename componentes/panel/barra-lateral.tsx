"use client";

import { useEffect, useId, useRef } from "react";
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
  const dialogo = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const escritorio = window.matchMedia("(min-width: 1200px)");
    const cerrarEnEscritorio = () => {
      if (escritorio.matches) dialogo.current?.close();
    };
    escritorio.addEventListener("change", cerrarEnEscritorio);
    return () => escritorio.removeEventListener("change", cerrarEnEscritorio);
  }, []);

  const enlacesAdmin = [
    { href: "/panel/admin/citas", label: "Citas", icono: CalendarCheck },
    { href: "/panel/admin/equipo", label: "Equipo", icono: Users },
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

  const cerrar = () => dialogo.current?.close();
  const contenido = (movil: boolean) => (
    <>
      <div className="flex min-h-0 flex-1 flex-col p-4 lg:overflow-y-auto">
        <div className="px-3 pt-2">
          <Link
            href="/"
            className="inline-block"
            onClick={movil ? cerrar : undefined}
          >
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
                onClick={movil ? cerrar : undefined}
              />
            </div>
          ))}
        </nav>
      </div>
      <div className="m-4 rounded-m bg-fondo-suave p-3 flex items-center gap-3">
        <div className="size-[44px] shrink-0 rounded-circulo bg-fondo-seccion text-texto-enlace flex items-center justify-center font-fuerte text-caption">
          {usuarioNombre.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <span className="block text-caption font-medio truncate">
            {usuarioNombre}
          </span>
          <CabeceraPanel usuarioNombre={usuarioNombre} rol={rol} compacto />
        </div>
      </div>
    </>
  );

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-borde-suave bg-fondo-superficie px-borde py-2 lg:hidden">
        <span className="text-p font-fuerte text-texto-titulo">
          {rol === "ADMIN" ? "Administración" : "Panel del psicólogo"}
        </span>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-controls={id}
          onClick={() => dialogo.current?.showModal()}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-m px-3 font-medio text-texto-enlace hover:bg-fondo-suave"
        >
          <Menu aria-hidden="true" />
          Menú del panel
        </button>
      </header>
      <dialog
        ref={dialogo}
        id={id}
        aria-label="Menú del panel"
        className="m-0 h-dvh max-h-dvh w-[min(100%,22rem)] max-w-none overflow-y-auto overscroll-contain bg-fondo-superficie text-texto-principal shadow-flotante backdrop:bg-morado-900/40"
        onClick={(evento) => {
          if (evento.target === evento.currentTarget) cerrar();
        }}
      >
        <div className="flex min-h-full flex-col">
          <div className="flex justify-end px-4 pt-3">
            <button
              type="button"
              onClick={cerrar}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-s px-3 font-medio text-texto-enlace hover:bg-fondo-suave"
            >
              <X aria-hidden="true" />
              Cerrar menú
            </button>
          </div>
          {contenido(true)}
        </div>
      </dialog>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col rounded-m border border-borde-suave bg-fondo-superficie lg:flex">
        {contenido(false)}
      </aside>
    </>
  );
}
