"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const editorial = (ruta: string) =>
  /^\/(?:servicios|como-funciona|equipo|contacto|eventos(?:\/[^/]+)?)?$/.test(
    ruta,
  );

export function TransicionRuta() {
  const ruta = usePathname();
  const anterior = useRef(ruta);
  useEffect(() => {
    const origen = anterior.current;
    anterior.current = ruta;
    if (
      origen === ruta ||
      !editorial(origen) ||
      !editorial(ruta) ||
      location.hash
    )
      return;

    const principal = document.getElementById("contenido-principal");
    const preferencia = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!principal || preferencia.matches) return;
    const detener = () => principal.classList.remove("capl-entrada-ruta");
    function terminar(evento: AnimationEvent) {
      if (
        evento.target === principal &&
        evento.animationName === "capl-entrada-ruta"
      ) {
        detener();
      }
    }
    principal.addEventListener("animationend", terminar);
    preferencia.addEventListener("change", detener);
    principal.classList.add("capl-entrada-ruta");
    return () => {
      principal.removeEventListener("animationend", terminar);
      preferencia.removeEventListener("change", detener);
      detener();
    };
  }, [ruta]);
  return null;
}
