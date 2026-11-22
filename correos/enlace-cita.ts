import { plantillaBase } from "./base";
import { formatoFechaHora } from "../servidor/fechas";

// Se envía al correo de la cita cuando alguien la consulta con su código (pie del sitio). Nunca se muestra la cita en pantalla.
export type Datos = { nombre: string; inicio: Date; rutaGestion: string };

export const render = (d: Datos) =>
  plantillaBase({
    ilustracion: "gato-acompanamiento",
    tono: "#e6f4ee",
    disposicion: "centrada",
    asunto: "Tu enlace para ver tu cita",
    titulo: "Aquí está tu cita",
    parrafos: [
      `Hola, ${d.nombre}. Pediste ver tu cita del ${formatoFechaHora(d.inicio)}. Desde el botón puedes consultarla, cambiar el horario o cancelarla. Si no fuiste tú, ignora este mensaje.`,
    ],
    boton: { texto: "Ver mi cita", ruta: d.rutaGestion },
  });

export const ejemplo: Datos = {
  nombre: "Ana",
  inicio: new Date("2026-11-24T19:30:00Z"),
  rutaGestion: "/cita/ejemplo",
};
