// Forma de respuesta de TODA operación (E05). `mensaje` ya viene redactado para mostrarse.
export const CODIGOS_ERROR = [
  "VALIDACION",
  "NO_AUTENTICADO",
  "SIN_PERMISO",
  "NO_ENCONTRADO",
  "ENLACE_INVALIDO",
  "ENLACE_VENCIDO",
  "CUPO_OCUPADO",
  "FUERA_DE_RANGO",
  "LIMITE_CITAS",
  "SERVICIO_NO_DISPONIBLE",
  "TRANSICION_INVALIDA",
  "FUERA_DE_PLAZO",
  "LIMITE_REPROGRAMACIONES",
  "CUPO_LLENO",
  "YA_INSCRITO",
  "EVENTO_CERRADO",
  "CORREO_NO_PERMITIDO",
  "CORREO_EN_USO",
  "TIENE_CITAS_FUTURAS",
  "CREDENCIALES",
  "CODIGO_REQUERIDO",
  "CODIGO_INVALIDO",
  "CONFIRMACION_REQUERIDA",
  "DEMASIADOS_INTENTOS",
  "ARCHIVO_INVALIDO",
  "ERROR_INTERNO",
] as const;

export type CodigoError = (typeof CODIGOS_ERROR)[number];

export type Resultado<T> =
  | { ok: true; datos: T }
  | {
      ok: false;
      codigo: CodigoError;
      mensaje: string;
      campos?: Record<string, string>;
    };

export const ok = <T>(datos: T): Resultado<T> => ({ ok: true, datos });
export const fallo = (
  codigo: CodigoError,
  mensaje: string,
  campos?: Record<string, string>,
): Resultado<never> => ({
  ok: false,
  codigo,
  mensaje,
  campos,
});

/** Cuando la acción ni siquiera llega al servidor (sin red, servidor caído). Nunca se finge el guardado. */
export const SIN_CONEXION =
  "No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.";
