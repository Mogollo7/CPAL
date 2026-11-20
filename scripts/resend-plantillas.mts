// Publica las plantillas de Resend generadas desde el código (correos/variables.ts): npm run resend:plantillas [-- --seco]
// Crea o actualiza cada plantilla (alias = nombre, el que usa la app al enviar) y la publica. Hay que correrlo cada vez que cambie
// el diseño de un correo y con el .env del entorno de destino (URL_SITIO, CORREO_RESPUESTA…: quedan fijos dentro de la plantilla).
import { parseArgs } from "node:util";
import { Resend } from "resend";

try {
  process.loadEnvFile();
} catch {}
const { values } = parseArgs({ options: { seco: { type: "boolean" } } });
const { plantillas, renderizar } = await import("../correos/indice");
const { aPlantilla } = await import("../correos/plantilla-resend");
const { mapaVariables } = await import("../correos/variables");

const llave = (process.env.RESEND_API_KEYS ?? "").split(",")[0]?.trim();
if (!values.seco && !llave) throw new Error("Falta RESEND_API_KEYS en el .env");
if (!process.env.URL_SITIO) throw new Error("Falta URL_SITIO en el .env");
const resend = new Resend(llave || "sin-llave");
let fallos = 0;

for (const [nombre, mapa] of Object.entries(mapaVariables)) {
  const n = nombre as keyof typeof plantillas;
  const ejemplo = plantillas[n].ejemplo;
  const vars = (
    mapa as { variables: (d: unknown) => Record<string, string> | null }
  ).variables(ejemplo);
  if (!vars) continue;
  const c = renderizar(n, ejemplo);
  const html = aPlantilla(c.html, vars);
  const campos = {
    name: nombre,
    subject: c.asunto,
    html,
    variables: Object.keys(vars).map((key) => ({
      key,
      type: "string" as const,
    })),
  };
  if (values.seco) {
    console.log(
      `${nombre}: ${campos.variables.length} variables, ${html.length} bytes`,
    );
    continue;
  }
  const existente = await resend.templates.get(nombre);
  const guardada = existente.data
    ? await resend.templates.update(nombre, campos)
    : await resend.templates.create({ ...campos, alias: nombre });
  const id = guardada.data?.id ?? existente.data?.id;
  const publicada = guardada.error
    ? null
    : await resend.templates.publish(id ?? nombre);
  const error = guardada.error ?? publicada?.error;
  if (error) fallos++;
  console.log(
    `${nombre}: ${error ? `ERROR ${error.name}: ${error.message}` : existente.data ? "actualizada y publicada" : "creada y publicada"}`,
  );
  await new Promise((r) => setTimeout(r, 600)); // Resend limita a pocas peticiones por segundo
}
process.exitCode = fallos ? 1 : 0;
