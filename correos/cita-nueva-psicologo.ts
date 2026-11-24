import { plantillaBase, fechaCorreo } from "./base";
import { RUTAS } from "./centro";

// Sin datos del paciente: se consultan en el panel.
export type Datos = {
  nombrePsicologo: string;
  servicio: string;
  inicio: Date;
  codigo: string;
};

export const render = (d: Datos) =>
  plantillaBase({
    ilustracion: "gato-calendario",
    tono: "#efeefb",
    disposicion: "fila",
    asunto: "Tienes una nueva cita",
    titulo: "Tienes una cita nueva",
    fecha: fechaCorreo(d.inicio, "Sesión asignada"),
    datos: [{ rotulo: "Servicio", valor: d.servicio }],
    pie_datos: `Solicitud ${d.codigo}`,
    parrafos: [
      `Hola, ${d.nombrePsicologo}. Se autorizó una nueva cita en tu agenda. Los datos de la persona están en el panel.`,
    ],
    boton: { texto: "Ver mi agenda", ruta: RUTAS.agenda },
  });

export const ejemplo: Datos = {
  nombrePsicologo: "Laura",
  servicio: "Orientación psicológica",
  inicio: new Date("2026-11-24T19:30:00Z"),
  codigo: "CAPL-7K3F",
};
