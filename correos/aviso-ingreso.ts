import { plantillaBase } from "./base";
import { RUTAS } from "./centro";
import { formatoFechaHora } from "../servidor/fechas";

export type Datos = { nombre: string; cuando: Date; navegador: string };

export const render = (d: Datos) =>
  plantillaBase({
    asunto: "Nuevo ingreso a tu cuenta del CAPL",
    parrafos: [
      `Hola, ${d.nombre}. Tu cuenta entró desde un dispositivo nuevo.`,
      `${formatoFechaHora(d.cuando)} · ${d.navegador}`,
      "Si fuiste tú, no tienes que hacer nada. Si no, cierra todas tus sesiones y cambia tu contraseña.",
    ],
    boton: { texto: "Cerrar mis sesiones", ruta: RUTAS.cerrarSesiones },
  });

export const ejemplo: Datos = {
  nombre: "Laura",
  cuando: new Date("2026-11-24T19:30:00Z"),
  navegador: "Chrome en Windows",
};
