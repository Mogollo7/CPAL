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
    asunto: "Se canceló una cita de tu agenda",
    titulo: "Se liberó un horario",
    fecha: fechaCorreo(d.inicio, "Horario liberado"),
    datos: [{ rotulo: "Servicio", valor: d.servicio }],
    pie_datos: `Solicitud ${d.codigo}`,
    parrafos: [
      `Hola, ${d.nombrePsicologo}. Se canceló una cita de tu agenda. El horario quedó libre.`,
    ],
    boton: { texto: "Ver mi agenda", ruta: RUTAS.agenda },
  });

export const ejemplo: Datos = {
  nombrePsicologo: "Laura",
  servicio: "Orientación psicológica",
  inicio: new Date("2026-11-24T19:30:00Z"),
  codigo: "CAPL-7K3F",
};
