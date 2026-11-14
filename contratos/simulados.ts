// Datos simulados (E05): misma forma que las operaciones reales, para que Brand y César maqueten ya.
// Cuando Sebas termine una operación, se cambia la importación y se borra su simulado.
import type { CitaCreada, CitaEntrada } from "./cita";
import type { Cupo } from "./cupo";
import { fallo, ok, type Resultado } from "./resultado";

const hora = (h: number): Cupo => ({
  inicio: `2026-11-24T${String(h).padStart(2, "0")}:00:00-05:00`,
  fin: `2026-11-24T${String(h + 1).padStart(2, "0")}:00:00-05:00`,
  psicologoIds: ["psi-1"],
});

export async function obtenerCupos(): Promise<Resultado<Cupo[]>> {
  return ok([8, 9, 10, 15, 16].map(hora));
}

// El horario de las 3:00 p. m. (20:00 UTC) siempre responde CUPO_OCUPADO.
export async function crearCita(
  c: CitaEntrada,
): Promise<Resultado<CitaCreada>> {
  if (new Date(c.inicio).getUTCHours() === 20)
    return fallo(
      "CUPO_OCUPADO",
      "Alguien tomó ese horario hace un momento. Elige otro.",
    );
  return ok({
    codigo: "CAPL-7K3F",
    estado: "PENDIENTE",
    inicio: c.inicio,
    enlaceGestion: "/cita/token-de-ejemplo",
  });
}
