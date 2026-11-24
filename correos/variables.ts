// Variables de cada plantilla de Resend: de los datos de un correo a { CLAVE: "texto tal como se ve" }.
// Reglas:
//  · Cada valor es el texto EXACTO (sin escapar) que aparece en el correo; usa las mismas funciones de formato que la plantilla
//    (formatoFechaHora, fechaCorreo…), no las reimplementes a mano.
//  · Si los datos toman una rama distinta a la de `ejemplo` (un indicador, un campo opcional vacío o presente, otro rol…),
//    la función devuelve `null`: ese correo se envía con el HTML propio de la app y no con la plantilla.
//  · `otros`: datos de la MISMA rama que `ejemplo`, pero con TODOS los valores distintos (otro nombre, otra fecha…): la prueba
//    comprueba que la plantilla con esos valores reproduce exactamente el HTML de la app.
import type { NombrePlantilla, plantillas } from "./indice";
import { variablesA } from "./variables-a";
import { variablesB } from "./variables-b";

export type DatosDe<N extends NombrePlantilla> = Parameters<
  (typeof plantillas)[N]["render"]
>[0];
export type Variables = Record<string, string>;
export type Mapa<N extends NombrePlantilla> = {
  variables: (d: DatosDe<N>) => Variables | null;
  otros: DatosDe<N>;
};
export type MapaVariables = { [N in NombrePlantilla]?: Mapa<N> };

export const mapaVariables: MapaVariables = { ...variablesA, ...variablesB };
