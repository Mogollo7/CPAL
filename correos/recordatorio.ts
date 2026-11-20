import { plantillaBase, fechaCorreo } from "./base";
import { centro } from "./centro";

export type Datos = {
  nombre: string;
  inicio: Date;
  psicologo: string;
  rutaGestion: string;
};

export const render = (d: Datos) =>
  plantillaBase({
    ilustracion: "gato-recordatorio",
    tono: "#fdf3dc",
    disposicion: "fila",
    asunto: "Recordatorio: tu cita es mañana",
    titulo: "Tu cita es mañana",
    fecha: fechaCorreo(d.inicio, "Tu sesión de mañana"),
    datos: [{ rotulo: "Lugar", valor: centro().direccion }],
    parrafos: [
      `Hola, ${d.nombre}. Te esperamos mañana para tu cita con ${d.psicologo}.`,
    ],
    nota: {
      titulo: "Si cambian tus planes",
      texto:
        "Si no puedes asistir, cancela o cambia el horario desde el botón para que otra persona pueda usar ese espacio.",
    },
    boton: { texto: "Ver mi cita", ruta: d.rutaGestion },
  });

export const ejemplo: Datos = {
  nombre: "Ana",
  inicio: new Date("2026-11-24T19:30:00Z"),
  psicologo: "Laura Gómez",
  rutaGestion: "/cita/ejemplo.firma",
};
