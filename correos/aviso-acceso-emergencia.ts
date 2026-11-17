import { plantillaBase } from "./base";
import { formatoFechaHora } from "../servidor/fechas";

// No está en E06: aviso a los demás administradores cuando se crea uno desde la consola del servidor (S02).
export type Datos = { nombre: string; nuevoNombre: string; cuando: Date };

export const render = (d: Datos) =>
  plantillaBase({
    asunto: "Se creó un administrador por acceso de emergencia",
    parrafos: [
      `Hola, ${d.nombre}. Alguien con acceso al servidor creó una cuenta de administración del CAPL mediante el acceso de emergencia.`,
      `${formatoFechaHora(d.cuando)} · cuenta nueva: ${d.nuevoNombre}`,
      "Si lo esperabas, no tienes que hacer nada. Si no, desactiva esa cuenta desde el panel y avisa a quien administra el servidor.",
    ],
    boton: {
      texto: "Ver administradores",
      ruta: "/panel/admin/administradores",
    },
  });

export const ejemplo: Datos = {
  nombre: "Laura",
  nuevoNombre: "Carlos Pérez",
  cuando: new Date("2026-11-24T19:30:00Z"),
};
