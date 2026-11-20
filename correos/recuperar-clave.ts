import { plantillaBase } from "./base";
import { RUTAS } from "./centro";

export type Datos = { nombre: string; token: string; horas: number };

export const render = (d: Datos) =>
  plantillaBase({
    ilustracion: "clave-sobre",
    tono: "#efeefb",
    disposicion: "centrada",
    asunto: "Crea una nueva contraseña",
    nota: {
      titulo: "¿No hiciste la solicitud?",
      texto: "Si no pediste esto, ignora este correo; tu contraseña no cambia.",
    },
    parrafos: [
      `Hola, ${d.nombre}. Recibimos una solicitud para crear una nueva contraseña. El enlace funciona durante ${d.horas} horas.`,
      "Si no pediste esto, ignora este correo; tu contraseña no cambia.",
    ],
    boton: { texto: "Crear contraseña", ruta: RUTAS.crearClave(d.token) },
  });

export const ejemplo: Datos = {
  nombre: "Laura",
  token: "token-de-ejemplo",
  horas: 48,
};
