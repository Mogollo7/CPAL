// `npm run correos`: genera el HTML y el texto de cada plantilla con datos de ejemplo en datos/archivos/vista-previa-correos/
// (carpeta ignorada por git). No envía nada.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { NOMBRES, plantillas, renderizar } from "./indice";

process.env.URL_SITIO ??= "http://localhost:3000";
const salida = join("datos", "archivos", "vista-previa-correos");
mkdirSync(salida, { recursive: true });

for (const n of NOMBRES) {
  const c = renderizar(n, plantillas[n].ejemplo);
  writeFileSync(join(salida, `${n}.html`), c.html);
  writeFileSync(join(salida, `${n}.txt`), c.texto);
  for (const a of c.adjuntos ?? [])
    writeFileSync(join(salida, `${n}-${a.nombre}`), a.contenido);
  console.log(`${n}: ${c.asunto}`);
}
console.log(`\n${NOMBRES.length} plantillas en ${salida}`);
