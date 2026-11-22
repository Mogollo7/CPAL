import type { ComponentProps } from "react";
import Link from "next/link";
import { cn } from "../cn";

// Figma · Átomos/Botón: píldora, 26 × 11, Nunito 600 16.
const TIPOS = {
  principal:
    "bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo shadow-flotante",
  suave: "bg-accion-suave-fondo text-accion-suave-texto hover:bg-morado-300/50",
  borde:
    "border-[1.5px] border-borde-suave bg-fondo-superficie text-texto-principal hover:bg-fondo-suave",
  claro: "bg-blanco text-petroleo-700 hover:bg-crema",
  ayuda:
    "bg-ayuda-fondo text-ayuda-texto font-fuerte shadow-ayuda hover:bg-amarillo-300",
} as const;

export type TipoBoton = keyof typeof TIPOS;

export const claseBoton = (tipo: TipoBoton = "principal", className?: string) =>
  cn(
    "inline-flex max-w-full min-h-[48px] items-center justify-center gap-3 rounded-pildora px-5 py-[11px] text-center text-p font-medio leading-texto wrap-anywhere transition duration-(--mov-rapido) ease-entrada active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none [&>svg]:shrink-0",
    TIPOS[tipo],
    className,
  );

type ConTipo = { tipo?: TipoBoton };

export function Boton({
  tipo,
  className,
  ...props
}: ComponentProps<"button"> & ConTipo) {
  return (
    <button type="button" className={claseBoton(tipo, className)} {...props} />
  );
}

export function BotonEnlace({
  tipo,
  className,
  ...props
}: ComponentProps<typeof Link> & ConTipo) {
  return <Link className={claseBoton(tipo, className)} {...props} />;
}
