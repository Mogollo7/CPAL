import { plantillaBase } from "./base";

// Sin botón: muestra el código. Vigencia de 10 minutos (S02).
export type Datos = { nombre: string; codigo: string };

export const render = (d: Datos) =>
  plantillaBase({
    asunto: "Tu código de ingreso al CAPL",
    parrafos: [
      `Hola, ${d.nombre}. Este es tu código de ingreso. Funciona durante 10 minutos.`,
      "Si no fuiste tú, cambia tu contraseña.",
    ],
    destacado: d.codigo,
  });

export const ejemplo: Datos = { nombre: "Laura", codigo: "482915" };
