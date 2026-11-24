"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoCapl } from "../atomos/logo-capl";
import { BotonEnlace } from "../atomos/boton";
import { cn } from "../cn";
import { ENLACES_PUBLICOS } from "./navegacion";

export function EncabezadoPublico() {
  const ruta = usePathname();
  const id = useId();
  const disparador = useRef<HTMLButtonElement>(null);
  const [rutaAbierta, setRutaAbierta] = useState<string | null>(null);
  const abierto = rutaAbierta === ruta;
  const cerrar = () => setRutaAbierta(null);

  return (
    <header
      className="sticky top-0 z-40 flex min-h-[4.25rem] flex-wrap items-center justify-between gap-3 border-b border-borde-suave bg-crema px-borde py-2 lg:min-h-encabezado lg:flex-nowrap lg:bg-crema/92 lg:backdrop-blur-[18px]"
      onKeyDown={(evento) => {
        if (evento.key === "Escape" && abierto) {
          cerrar();
          disparador.current?.focus();
        }
      }}
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget)) cerrar();
      }}
    >
      <Link href="/" aria-label="CAPL · inicio" className="rounded-s">
        <LogoCapl />
      </Link>
      <button
        ref={disparador}
        type="button"
        aria-expanded={abierto}
        aria-controls={id}
        onClick={() => setRutaAbierta(abierto ? null : ruta)}
        className="inline-flex min-h-[48px] shrink-0 items-center gap-2 rounded-s px-3 font-medio text-texto-enlace hover:bg-fondo-suave lg:hidden"
      >
        {abierto ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        Menú
      </button>
      <nav
        id={id}
        aria-label="Principal"
        className={cn(
          "max-h-[calc(100dvh-10rem)] min-w-0 basis-full overflow-y-auto border-t border-borde-suave pt-2 pb-3 lg:flex lg:max-h-none lg:flex-1 lg:basis-auto lg:justify-between lg:items-center lg:gap-5 lg:overflow-visible lg:border-0 lg:p-0",
          abierto ? "block" : "hidden",
        )}
      >
        <ul className="flex flex-col lg:mx-auto lg:flex-row lg:items-center lg:gap-5">
          {ENLACES_PUBLICOS.map(({ ruta: href, nombre }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={cerrar}
                aria-current={
                  ruta === href || ruta.startsWith(`${href}/`)
                    ? "page"
                    : undefined
                }
                className="flex min-h-[48px] items-center rounded-s px-3 py-2 text-p font-medio text-texto-principal hover:bg-fondo-suave aria-[current=page]:bg-fondo-suave aria-[current=page]:text-texto-enlace aria-[current=page]:underline lg:px-0"
              >
                {nombre}
              </Link>
            </li>
          ))}
        </ul>
        <BotonEnlace
          href="/pedir-cita"
          onClick={cerrar}
          className="mt-3 w-full lg:mt-0 lg:w-auto"
        >
          Pedir mi cita
        </BotonEnlace>
      </nav>
    </header>
  );
}
