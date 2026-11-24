// Adaptador de Resend (S04). El resto del código solo conoce `enviarCorreo()`.
// Rotación: RESEND_API_KEYS="re_principal,re_respaldo,..." (por prioridad). Si la llave activa responde
// 429 / cuota diaria agotada, se marca agotada y se reintenta al instante con la siguiente.
// Para añadir otra cuenta: agregar su llave al final de la lista en .env y reiniciar. Nada más.
import { Resend } from "resend";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { registrar } from "../registro";

export type Correo = {
  para: string;
  asunto: string;
  html: string;
  texto: string;
  adjuntos?: { nombre: string; contenido: string; tipo: string }[]; // contenido en texto (p. ej. .ics)
  trabajoId?: string; // viaja como etiqueta: el aviso de entrega de Resend lo trae de vuelta (T-332)
  llave?: string; // llave del trabajo: Resend la usa para no enviar dos veces el mismo correo (idempotencia)
};
export type ErrorEnvio = {
  statusCode?: number | null;
  name?: string;
  message?: string;
};
type Enviar = (llave: string, c: Correo) => Promise<ErrorEnvio | null>;
export type ResultadoEnvio =
  | { ok: true; llaveUsada: number }
  | { ok: false; permanente: boolean; error: string };

const CUOTA = new Set([
  "rate_limit_exceeded",
  "daily_quota_exceeded",
  "monthly_quota_exceeded",
]);
const DIA_MS = 24 * 60 * 60 * 1000;
// ponytail: estado en memoria (1 proceso). Si se escala a varios procesos, moverlo a la BD.
const agotadasHasta = new Map<string, number>();

export const esCuotaAgotada = (e: ErrorEnvio) =>
  e.statusCode === 429 || (!!e.name && CUOTA.has(e.name));
const llaves = () =>
  (process.env.RESEND_API_KEYS ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

const enviarConResend: Enviar = async (llave, c) => {
  const { error } = await new Resend(llave).emails.send(
    {
      from: process.env.CORREO_REMITENTE || "CAPL <onboarding@resend.dev>",
      replyTo: process.env.CORREO_RESPUESTA || undefined,
      to: c.para,
      subject: c.asunto,
      html: c.html,
      text: c.texto,
      attachments: c.adjuntos?.map((a) => ({
        filename: a.nombre,
        content: Buffer.from(a.contenido),
        contentType: a.tipo,
      })),
      tags: c.trabajoId ? [{ name: "trabajo", value: c.trabajoId }] : undefined,
    },
    c.llave ? { idempotencyKey: c.llave } : undefined,
  );
  return error;
};

export async function enviarCorreo(
  c: Correo,
  enviar: Enviar = enviarConResend,
  ahora = Date.now(),
): Promise<ResultadoEnvio> {
  const modo = process.env.CORREO_MODO ?? "consola";
  if (modo === "consola") {
    const buzon =
      process.env.ENTORNO === "local" && process.env.CORREO_BUZON_LOCAL;
    if (buzon) {
      try {
        await mkdir(buzon, { recursive: true, mode: 0o700 });
        await writeFile(
          join(buzon, `${Date.now()}-${randomUUID()}.txt`),
          `Para: ${c.para}\nAsunto: ${c.asunto}\n\n${c.texto}`,
          { mode: 0o600, flag: "wx" },
        );
      } catch {
        return { ok: false, permanente: false, error: "BUZON_LOCAL" };
      }
    }
    registrar("externo.llamada", {
      servicio: "correo-consola",
      operacion: "enviar",
      resultado: "ok",
    }); // sin destinatario ni contenido (S06)
    return { ok: true, llaveUsada: -1 };
  }
  // En pruebas, nada real: se desvía o no se envía (E01).
  if (process.env.ENTORNO === "pruebas") {
    const desvio = process.env.CORREO_REDIRIGIR_A;
    if (!desvio) return { ok: true, llaveUsada: -1 };
    c = { ...c, para: desvio, asunto: `[PRUEBA → ${c.para}] ${c.asunto}` };
  }

  const lista = llaves();
  if (!lista.length)
    return { ok: false, permanente: true, error: "SIN_LLAVES" };

  for (const [i, llave] of lista.entries()) {
    if ((agotadasHasta.get(llave) ?? 0) > ahora) continue;
    const t0 = performance.now();
    const error = await enviar(llave, c);
    registrar("externo.llamada", {
      servicio: "resend",
      operacion: "enviar",
      ms: Math.round(performance.now() - t0),
      resultado: error ? (error.name ?? String(error.statusCode)) : "ok",
    });
    if (!error) return { ok: true, llaveUsada: i };
    if (esCuotaAgotada(error)) {
      agotadasHasta.set(llave, ahora + DIA_MS);
      registrar("externo.respaldo_usado", {
        nivel: "aviso",
        servicio: "resend",
        operacion: `cuota_agotada_cuenta_${i + 1}`,
      });
      continue;
    }
    // Permanente SOLO si los datos del correo son inválidos (400/422): reintentar no lo arregla. Una llave inválida o
    // sin permiso (401/403), un 5xx o un corte de red son temporales: el trabajo se reintenta y se avisa (S04 regla 6).
    const permanente = error.statusCode === 400 || error.statusCode === 422;
    return { ok: false, permanente, error: error.name ?? "ERROR_RESEND" };
  }
  return { ok: false, permanente: false, error: "TODAS_LAS_LLAVES_AGOTADAS" };
}

export const _reiniciarAgotadas = () => agotadasHasta.clear(); // solo para pruebas
