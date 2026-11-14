// Registros estructurados (S06): una línea JSON por evento en stdout, escrita SOLO por `registrar()`.
// Los campos son un conjunto cerrado y de tipos simples: no existe dónde meter nombres, correos, documentos,
// motivos, tokens ni cuerpos de petición. Un evento nuevo se añade primero al catálogo de S06 y luego aquí.
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

export const EVENTOS = [
  "http.peticion",
  "http.error",
  "cita.creada",
  "cita.autorizada",
  "cita.rechazada",
  "cita.vencida",
  "cita.cancelada",
  "cita.reprogramada",
  "cita.atendida",
  "cita.inasistencia",
  "cita.cupo_ocupado",
  "cita.limite_alcanzado",
  "cuenta.ingreso",
  "cuenta.ingreso_fallido",
  "cuenta.bloqueada",
  "cuenta.codigo_enviado",
  "cuenta.codigo_fallido",
  "cuenta.dispositivo_nuevo",
  "cuenta.clave_creada",
  "cuenta.enlace_solicitado",
  "cuenta.sesion_cerrada",
  "admin.psicologo_creado",
  "admin.psicologo_desactivado",
  "admin.config_cambiada",
  "admin.exportacion",
  "admin.admin_creado",
  "admin.acceso_emergencia",
  "permiso.negado",
  "cola.encolado",
  "cola.hecho",
  "cola.reintento",
  "cola.fallido",
  "cola.rescatado",
  "externo.llamada",
  "externo.corte_abierto",
  "externo.corte_cerrado",
  "externo.respaldo_usado",
  "webhook.recibido",
  "webhook.firma_invalida",
  "tarea.latido",
  "tarea.resumen",
  "tarea.paso_fallido",
  "evento.publicado",
  "evento.inscripcion",
  "evento.cupo_lleno",
  "limite.excedido",
  "bd.consulta_lenta",
  "bd.migracion",
] as const;

export type Evento = (typeof EVENTOS)[number] | `uso.${string}`;
export type Nivel = "info" | "aviso" | "error";
export type Rol = "publico" | "psicologo" | "admin" | "sistema";

export type Campos = {
  nivel?: Nivel; // por defecto "info"
  ruta?: string; // ya sin identificadores: usa `rutaLimpia()`
  rol?: Rol;
  actor?: string; // id interno del usuario; solo personal, nunca público
  entidad?: string; // "cita:ckx…": id interno, jamás el código legible ni un nombre
  ms?: number;
  resultado?: string; // "ok" o un código de error de E05
  estado?: number; // código HTTP
  servicio?: string; // externo.llamada: "resend"…
  operacion?: string; // nombre de la operación, nunca sus datos
  accion?: string; // limite.excedido
  red?: string; // dirección de red YA truncada con `redTruncada()`
};

const contexto = new AsyncLocalStorage<{ peticion: string }>();

export const nuevoIdPeticion = () => randomUUID().slice(0, 8);

/** Ejecuta `fn` con un identificador de petición: todas las líneas de registro que salgan dentro lo llevan. */
export const conPeticion = <T>(id: string, fn: () => T): T =>
  contexto.run({ peticion: id }, fn);

export function registrar(evento: Evento, campos: Campos = {}): void {
  const linea = {
    t: new Date().toISOString(),
    nivel: "info",
    evento,
    peticion: contexto.getStore()?.peticion,
    ...campos,
  };
  process.stdout.write(JSON.stringify(linea) + "\n");
}

/** `/cita/abc123` → `/cita/[token]`. Las rutas con identificadores o tokens nunca se registran tal cual. */
export function rutaLimpia(ruta: string): string {
  return ruta
    .replace(/^\/(cita|crear-clave)\/[^/]+/, "/$1/[token]")
    .replace(/^\/eventos\/[^/]+/, "/eventos/[slug]")
    .replace(/^\/api\/webhooks\/([^/]+).*/, "/api/webhooks/$1");
}

/** Dirección de red truncada: IPv4 sin el último octeto, IPv6 solo los 3 primeros bloques. */
export function redTruncada(ip: string): string {
  if (ip.includes(":")) return ip.split(":").slice(0, 3).join(":") + "::";
  return ip.split(".").slice(0, 3).join(".") + ".0";
}

/** Envuelve un route handler: identificador de petición, línea `http.peticion` y cabecera `x-peticion`. */
export function conRegistro(
  handler: (req: Request) => Promise<Response> | Response,
) {
  return (req: Request): Promise<Response> => {
    const id = nuevoIdPeticion();
    return conPeticion(id, async () => {
      const t0 = performance.now();
      const ruta = rutaLimpia(new URL(req.url).pathname);
      try {
        const res = await handler(req);
        res.headers.set("x-peticion", id);
        registrar("http.peticion", {
          ruta,
          estado: res.status,
          ms: Math.round(performance.now() - t0),
          resultado: res.ok ? "ok" : "error",
        });
        return res;
      } catch {
        registrar("http.error", {
          nivel: "error",
          ruta,
          ms: Math.round(performance.now() - t0),
          resultado: "ERROR_INTERNO",
        });
        const res = Response.json({ estado: "error" }, { status: 500 });
        res.headers.set("x-peticion", id);
        return res;
      }
    });
  };
}
