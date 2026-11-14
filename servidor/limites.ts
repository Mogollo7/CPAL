// Límites de intentos (E03 §8). En memoria del proceso, una sola instancia.
// ponytail: se reinicia al reiniciar la app y no se comparte entre instancias; con varias instancias, pasar a la BD.
const HORA = 3_600_000;
const MIN = 60_000;

export const LIMITES = {
  pedirCita: { max: 5, ventanaMs: HORA }, // por dirección de red
  inscribirseEvento: { max: 5, ventanaMs: HORA }, // por dirección de red
  solicitarEnlace: { max: 3, ventanaMs: HORA }, // por correo
  consultarCupos: { max: 60, ventanaMs: MIN }, // por dirección de red
  reenviarCodigo: { max: 3, ventanaMs: HORA }, // por usuario (S02)
} as const;

export type Accion = keyof typeof LIMITES;
export type Veredicto =
  { permitido: true } | { permitido: false; esperaSeg: number };

const registro = new Map<string, number[]>(); // clave → instantes de los intentos dentro de la ventana

/** Cuenta un intento de `accion` para `quien` (IP, correo…). Ventana deslizante. */
export function limitar(
  accion: Accion,
  quien: string,
  ahora = Date.now(),
): Veredicto {
  const { max, ventanaMs } = LIMITES[accion];
  const clave = `${accion}:${quien}`;
  const recientes = (registro.get(clave) ?? []).filter(
    (t) => t > ahora - ventanaMs,
  );
  if (recientes.length >= max) {
    registro.set(clave, recientes);
    return {
      permitido: false,
      esperaSeg: Math.ceil((recientes[0] + ventanaMs - ahora) / 1000),
    };
  }
  recientes.push(ahora);
  registro.set(clave, recientes);
  return { permitido: true };
}

export const _reiniciarLimites = () => registro.clear(); // solo para pruebas
