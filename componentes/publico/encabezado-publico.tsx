"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, AlertCircle, CalendarPlus } from "lucide-react";
import { cn } from "@/componentes/ui/cn";
import logoCapl from "@/contenido/marca/logo-capl-original.png";

export interface EnlaceNavegacion {
  nombre: string;
  ruta: string;
}

const enlacesNavegacion: EnlaceNavegacion[] = [
  { nombre: "Inicio", ruta: "/" },
  { nombre: "Cómo funciona", ruta: "/como-funciona" },
  { nombre: "Servicios", ruta: "/servicios" },
  { nombre: "Eventos", ruta: "/eventos" },
  { nombre: "Contacto", ruta: "/contacto" },
];

export function EncabezadoPublico() {
  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);
  const pathname = usePathname();

  // Manejar tecla Escape para accesibilidad
  useEffect(() => {
    const manejarTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuAbierto) {
        setMenuAbierto(false);
      }
    };
    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [menuAbierto]);

  return (
    <header className="sticky top-0 z-40 w-full bg-fondo-superficie/95 backdrop-blur-sm border-b border-borde-suave">
      {/* 1. Banner superior permanente y discreto (RF-PUB-08) */}
      <div
        role="region"
        aria-label="Aviso institucional de urgencias"
        className="w-full bg-morado-900 text-blanco py-2 px-4 text-center text-caption font-normal border-b border-morado-700"
      >
        <div className="mx-auto max-w-[1200px] flex items-center justify-center gap-2 flex-wrap">
          <AlertCircle
            className="w-4 h-4 text-amarillo-500 shrink-0"
            aria-hidden="true"
          />
          <span>
            El CAPL no atiende urgencias médicas o psiquiátricas inmediatas.
          </span>
          <Link
            href="/ayuda-inmediata"
            className="text-amarillo-300 hover:text-amarillo-100 font-medio underline decoration-1 underline-offset-2 focus-visible:outline-2 focus-visible:outline-amarillo-500 rounded-s"
          >
            Consulta aquí la Guía de Ayuda Inmediata y líneas 24/7
          </Link>
        </div>
      </div>

      {/* 2. Barra de navegación principal */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo y Nombre del Centro */}
          <Link
            href="/"
            className="flex items-center gap-3 focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2 rounded-m p-1"
            aria-label="Ir a la página de inicio del CAPL"
          >
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0">
              <Image
                src={logoCapl}
                alt="Logo oficial del Centro de Atención Psicológica Lasallista"
                fill
                priority
                sizes="(max-width: 640px) 48px, 56px"
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-fuerte text-p leading-titulo text-texto-titulo tracking-tight">
                CAPL
              </span>
              <span className="text-caption text-texto-secundario leading-titulo hidden sm:inline-block">
                Centro de Atención Psicológica Lasallista
              </span>
            </div>
          </Link>

          {/* Enlaces de escritorio (md+) */}
          <nav
            aria-label="Navegación principal de escritorio"
            className="hidden md:flex items-center gap-1 lg:gap-2"
          >
            {enlacesNavegacion.map((enlace) => {
              const estaActivo = pathname === enlace.ruta;
              return (
                <Link
                  key={enlace.ruta}
                  href={enlace.ruta}
                  onClick={() => setMenuAbierto(false)}
                  className={cn(
                    "min-h-[48px] px-3 lg:px-4 py-2 rounded-m text-p font-medio inline-flex items-center transition-colors duration-mov-rapido",
                    "focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2",
                    estaActivo
                      ? "text-morado-900 bg-morado-50 border-b-2 border-morado-600 font-fuerte"
                      : "text-texto-principal hover:text-texto-enlace hover:bg-morado-50",
                  )}
                  aria-current={estaActivo ? "page" : undefined}
                >
                  {enlace.nombre}
                </Link>
              );
            })}
          </nav>

          {/* Acción principal "Pedir cita" + Botón Menú Móvil */}
          <div className="flex items-center gap-3">
            <Link
              href="/pedir-cita"
              className={cn(
                "min-h-[48px] px-5 py-2.5 rounded-m bg-accion-fondo text-accion-texto font-medio text-p shadow-sm",
                "hover:bg-accion-fondo-activo active:bg-accion-fondo-activo",
                "transition-colors duration-mov-rapido inline-flex items-center gap-2",
                "focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2",
              )}
            >
              <CalendarPlus className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">Pedir cita</span>
            </Link>

            {/* Botón hamburguesa móvil (md:hidden) */}
            <button
              type="button"
              onClick={() => setMenuAbierto((prev) => !prev)}
              aria-expanded={menuAbierto}
              aria-controls="menu-movil"
              aria-label={
                menuAbierto
                  ? "Cerrar menú de navegación"
                  : "Abrir menú de navegación"
              }
              className="md:hidden min-h-[48px] min-w-[48px] p-3 rounded-m text-texto-principal hover:bg-fondo-suave inline-flex items-center justify-center focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2 transition-colors duration-mov-rapido"
            >
              {menuAbierto ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Menú móvil desplegable */}
      {menuAbierto && (
        <div
          id="menu-movil"
          className="md:hidden border-t border-borde-suave bg-fondo-superficie px-4 py-6 shadow-md"
        >
          <nav
            aria-label="Navegación principal móvil"
            className="flex flex-col space-y-2"
          >
            {enlacesNavegacion.map((enlace) => {
              const estaActivo = pathname === enlace.ruta;
              return (
                <Link
                  key={enlace.ruta}
                  href={enlace.ruta}
                  onClick={() => setMenuAbierto(false)}
                  className={cn(
                    "min-h-[48px] px-4 py-3 rounded-m text-p font-medio flex items-center transition-colors duration-mov-rapido",
                    "focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2",
                    estaActivo
                      ? "text-morado-900 bg-morado-100 font-fuerte"
                      : "text-texto-principal hover:bg-morado-50 hover:text-texto-enlace",
                  )}
                  aria-current={estaActivo ? "page" : undefined}
                >
                  {enlace.nombre}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
