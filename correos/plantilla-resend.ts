// Plantillas de Resend generadas desde el propio código de cada correo (una sola fuente de verdad):
// el HTML con los datos de `ejemplo` se vuelve plantilla cambiando cada valor variable por {{{CLAVE}}}.
// `sustituir` hace el camino inverso. La prueba `variables.test.ts` comprueba que ida y vuelta con OTROS datos
// reproduce exactamente el HTML que renderiza la app.
import { esc } from "./base";

const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Cambia cada valor por {{{CLAVE}}}. Solo cuenta si no está pegado a letras o números (el «24» no se toca dentro de «2026»). */
export function aPlantilla(html: string, vars: Record<string, string>) {
  let h = html;
  const pares = Object.entries(vars)
    .filter(([, v]) => v !== "")
    .sort((a, b) => b[1].length - a[1].length); // primero los largos: «CAPL-7K3F» antes que «7»
  for (const [clave, valor] of pares)
    for (const forma of new Set([esc(valor), encodeURIComponent(valor), valor]))
      h = h.replace(
        new RegExp(
          String.raw`(?<![\p{L}\p{N}])${reEsc(forma)}(?![\p{L}\p{N}])`,
          "gu",
        ),
        `{{{${clave}}}}`,
      );
  return h;
}

/** Lo que hace Resend al enviar: pone cada variable en su {{{CLAVE}}} (el valor ya llega listo para HTML). */
export function sustituir(plantilla: string, vars: Record<string, string>) {
  return plantilla.replace(/\{\{\{([A-Z0-9_]+)\}\}\}/g, (_, k: string) =>
    k in vars ? esc(vars[k]) : "",
  );
}

/** Lo que se manda a Resend: los valores ya escapados para HTML (la plantilla los inserta tal cual, con triple llave). */
export const paraEnvio = (vars: Record<string, string>) =>
  Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, esc(v)]));
