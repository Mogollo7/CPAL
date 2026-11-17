// Medición de uso propia, anónima y agregada (S07). Recibe el lote del script `public/medir.js`, descarta todo lo que
// no reconoce y escribe `uso.*` con `registrar()`. No toca la base de datos ni guarda dirección de red ni cookies.
import { z } from "zod";
import { registrar, rutaLimpia } from "../registro";

const MAX_LOTE = 30; // S07: lote de máximo 30
const MAX_POR_MINUTO = 60; // S07: 60 eventos por minuto por visita
const MAX_BYTES = 8 * 1024;
const BOTS =
  /bot|crawl|spider|slurp|headless|lighthouse|preview|curl|wget|python|monitor|uptime/i;
const EXCLUIDA = /^\/(ingresar|crear-clave|recuperar-clave|panel)(\/|$)/; // S07: nada aquí
const rutaOk = /^\/[a-z0-9\-/[\]]{0,80}$/;
const zona = z.string().regex(/^[a-z0-9-]{1,40}$/);

const evento = z.discriminatedUnion("t", [
  z.object({
    t: z.literal("vista"),
    pantalla: z.enum(["movil", "tableta", "escritorio"]),
    origen: z.enum(["directo", "interno", "buscador", "red", "otro"]),
  }),
  z.object({
    t: z.literal("permanencia"),
    rango: z.enum(["0-10", "10-30", "30-60", "1-3min", "3+min"]),
  }),
  z.object({
    t: z.literal("desplazamiento"),
    profundidad: z.union([
      z.literal(25),
      z.literal(50),
      z.literal(75),
      z.literal(100),
    ]),
  }),
  z.object({ t: z.literal("toque"), zona }),
  z.object({
    t: z.literal("paso"),
    paso: z.number().int().min(1).max(5),
    enviado: z.boolean(),
  }),
  z.object({
    t: z.literal("error_formulario"),
    paso: z.number().int().min(1).max(5),
    campo: z.string().regex(/^[a-z0-9_]{1,40}$/),
  }),
  z.object({ t: z.literal("sin_cupos") }),
  z.object({
    t: z.literal("rendimiento"),
    ms: z.number().int().min(0).max(60_000),
  }),
]);
type Evento = z.infer<typeof evento>;

const lote = z.object({
  r: z.string().max(120),
  v: z
    .string()
    .regex(/^[a-z0-9]{8,32}$/)
    .optional(),
  e: z.array(z.unknown()).max(MAX_LOTE),
});

// ponytail: en memoria del proceso, como `limites.ts`; con varias instancias pasar a la BD.
const porVisita = new Map<string, number[]>();
export const _reiniciarMedicion = () => porVisita.clear(); // solo para pruebas

function cabeUnaVisita(v: string, n: number, ahora: number): boolean {
  if (porVisita.size > 5000) porVisita.clear(); // tope de memoria
  const recientes = (porVisita.get(v) ?? []).filter((t) => t > ahora - 60_000);
  if (recientes.length + n > MAX_POR_MINUTO) return false;
  for (let i = 0; i < n; i++) recientes.push(ahora);
  porVisita.set(v, recientes);
  return true;
}

/** ¿Este evento se puede medir en esta ruta? (tabla "Dónde no se mide, o se mide menos", S07). */
function permitido(ruta: string, e: Evento): boolean {
  if (ruta === "/ayuda-inmediata")
    return e.t === "vista" || (e.t === "toque" && e.zona.startsWith("llamar"));
  if (ruta === "/cita/[token]") return e.t === "vista";
  return true;
}

export type EntradaMedicion = {
  activo: boolean; // MEDICION=si
  texto: string; // cuerpo crudo
  cabeceras: Pick<Headers, "get">;
  ahora?: number;
};

/** Valida y registra un lote. Devuelve cuántos eventos se registraron. Nunca guarda la dirección de red. */
export function procesarMedicion({
  activo,
  texto,
  cabeceras,
  ahora = Date.now(),
}: EntradaMedicion): number {
  if (!activo) return 0;
  // S07 regla 8: "no rastrear" (DNT o GPC) → no se mide nada.
  if (cabeceras.get("dnt") === "1" || cabeceras.get("sec-gpc") === "1")
    return 0;
  const agente = cabeceras.get("user-agent") ?? "";
  if (!agente || BOTS.test(agente)) return 0;
  if (texto.length > MAX_BYTES) return 0;

  let crudo: unknown;
  try {
    crudo = JSON.parse(texto);
  } catch {
    return 0;
  }
  const l = lote.safeParse(crudo);
  if (!l.success) return 0;

  const ruta = rutaLimpia(l.data.r.split(/[?#]/)[0]);
  if (!rutaOk.test(ruta) || EXCLUIDA.test(ruta)) return 0;

  const validos = l.data.e
    .map((x) => evento.safeParse(x))
    .flatMap((x) => (x.success ? [x.data] : []))
    .filter((e) => permitido(ruta, e));
  if (!validos.length) return 0;

  // Sin identificador de visita en la ayuda inmediata (S07): ahí no hay con qué limitar ni con qué enlazar.
  const visita = ruta === "/ayuda-inmediata" ? undefined : l.data.v;
  if (visita && !cabeUnaVisita(visita, validos.length, ahora)) return 0;

  // Los campos de `registrar()` son un conjunto cerrado (S06): el detalle viaja en operacion/accion/resultado.
  const base = {
    ruta,
    rol: "publico" as const,
    entidad: visita ? `visita:${visita}` : undefined,
  };
  for (const e of validos) {
    switch (e.t) {
      case "vista":
        registrar("uso.vista", {
          ...base,
          operacion: e.pantalla,
          resultado: e.origen,
        });
        break;
      case "permanencia":
        registrar("uso.permanencia", { ...base, resultado: e.rango });
        break;
      case "desplazamiento":
        registrar("uso.desplazamiento", {
          ...base,
          resultado: String(e.profundidad),
        });
        break;
      case "toque":
        registrar("uso.toque", { ...base, accion: e.zona });
        break;
      case "paso":
        registrar("uso.paso", {
          ...base,
          operacion: String(e.paso),
          resultado: e.enviado ? "enviado" : "alcanzado",
        });
        break;
      case "error_formulario":
        registrar("uso.error_formulario", {
          ...base,
          operacion: String(e.paso),
          accion: e.campo,
        });
        break;
      case "sin_cupos":
        registrar("uso.sin_cupos", base);
        break;
      case "rendimiento":
        registrar("uso.rendimiento", { ...base, ms: e.ms });
        break;
    }
  }
  return validos.length;
}
