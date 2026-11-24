"use client";

import { useSyncExternalStore } from "react";

const consulta = "(prefers-reduced-motion: reduce)";

function suscribir(actualizar: () => void) {
  const preferencia = window.matchMedia(consulta);
  preferencia.addEventListener("change", actualizar);
  return () => preferencia.removeEventListener("change", actualizar);
}

export function useMovimientoReducido() {
  return useSyncExternalStore(
    suscribir,
    () => window.matchMedia(consulta).matches,
    () => true,
  );
}
