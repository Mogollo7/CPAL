import { plantillaBase } from "./base";
import { RUTAS } from "./centro";

export type Datos = {
  nombre: string;
  rol: "ADMIN" | "PSICOLOGO";
  token: string; // en claro: solo viaja en este correo
  horas: number;
};

export const render = (d: Datos) =>
  plantillaBase({
    ilustracion: "gato-saludo",
    tono: "#efeefb",
    disposicion: "centrada",
    asunto: "Te damos la bienvenida al equipo del CAPL",
    titulo: "Te damos la bienvenida al CAPL",
    parrafos: [
      `Hola, ${d.nombre}. Has sido invitado/a como ${d.rol === "ADMIN" ? "administrador/a" : "psicólogo/a"} del CAPL.`,
    ],
    nota: {
      titulo: "Activa tu cuenta",
      texto: `Tu usuario es este correo. Crea tu contraseña para ingresar. El enlace funciona durante ${d.horas} horas; si vence, puedes pedir otro desde la página de ingreso.`,
    },
    boton: { texto: "Crear mi contraseña", ruta: RUTAS.crearClave(d.token) },
  });

export const ejemplo: Datos = {
  nombre: "Laura",
  rol: "PSICOLOGO",
  token: "token-de-ejemplo",
  horas: 48,
};
