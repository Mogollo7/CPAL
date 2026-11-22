"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/componentes/cn";
import { Boton } from "@/componentes/atomos/boton";

const CLAVE = "capl:aviso-cookies:v1";

export function AvisoCookies() {
  const [visible, setVisible] = useState(false);
  const enAyudaInmediata = usePathname() === "/ayuda-inmediata";

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      try {
        if (localStorage.getItem(CLAVE) === "entendido") return;
      } catch {
        return setVisible(true);
      }
      setVisible(true);
    }, 1000);
    return () => window.clearTimeout(temporizador);
  }, []);

  if (!visible) return null;

  return (
    <aside
      aria-label="Aviso de cookies"
      className={cn(
        "max-w-sm space-y-2 rounded-m border border-borde-suave bg-fondo-superficie p-3 shadow-flotante",
        enAyudaInmediata
          ? "mx-4 my-5 self-start sm:ml-[34px]"
          : "fixed inset-x-4 bottom-[88px] z-40 sm:right-auto sm:bottom-[34px] sm:left-[34px]",
      )}
    >
      <p className="text-caption text-texto-principal">
        Este sitio solo usa cookies esenciales. Lee nuestra{" "}
        <Link
          href="/privacidad"
          className="text-texto-enlace underline focus-visible:outline-2 focus-visible:outline-foco"
        >
          política de privacidad
        </Link>
        .
      </p>
      <Boton
        tipo="suave"
        onClick={() => {
          setVisible(false);
          try {
            localStorage.setItem(CLAVE, "entendido");
          } catch {
            return;
          }
        }}
      >
        Entendido
      </Boton>
    </aside>
  );
}
