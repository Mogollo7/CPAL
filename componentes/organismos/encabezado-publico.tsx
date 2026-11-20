"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { LogoCapl } from "../atomos/logo-capl";
import { BotonEnlace } from "../atomos/boton";
import { cn } from "../cn";
import { ENLACES_PUBLICOS } from "./navegacion";

// Figma · Organismos/Encabezado público: 88 de alto, velo crema 92 % con desenfoque 18, borde inferior lavanda.
export function EncabezadoPublico() {
  const ruta = usePathname();
  const enlaces = ENLACES_PUBLICOS.map((e) => (
    <Link
      key={e.ruta}
      href={e.ruta}
      aria-current={ruta.startsWith(e.ruta) ? "page" : undefined}
      className="rounded-s py-2 text-p font-medio text-texto-principal hover:text-texto-enlace aria-[current=page]:text-texto-enlace"
    >
      {e.nombre}
    </Link>
  ));

  return (
    <header className="sticky top-0 z-40 flex h-encabezado items-center justify-between border-b border-borde-suave bg-crema/92 px-4 backdrop-blur-[18px] sm:px-borde">
      <Link href="/" aria-label="CAPL · inicio" className="rounded-s">
        <LogoCapl />
      </Link>

      <nav aria-label="Principal" className="hidden items-center gap-5 md:flex">
        {enlaces}
      </nav>

      <div className="flex items-center gap-3">
        <BotonEnlace href="/pedir-cita" className="hidden sm:inline-flex">
          Pedir mi cita
        </BotonEnlace>
        {/* Móvil: menú nativo sin estado propio; se cierra al navegar porque cambia la ruta. */}
        <details key={ruta} className="relative md:hidden">
          <summary
            aria-label="Abrir menú"
            className="flex min-h-[48px] min-w-[48px] cursor-pointer list-none items-center justify-center rounded-m [&::-webkit-details-marker]:hidden"
          >
            <Menu className="size-[24px]" aria-hidden="true" />
          </summary>
          <nav
            aria-label="Principal"
            className={cn(
              "absolute right-0 top-full mt-3 flex w-[256px] flex-col gap-1 rounded-l border border-borde-suave bg-fondo-superficie p-4 shadow-flotante",
            )}
          >
            {enlaces}
            <BotonEnlace href="/pedir-cita" className="mt-3">
              Pedir mi cita
            </BotonEnlace>
          </nav>
        </details>
      </div>
    </header>
  );
}
