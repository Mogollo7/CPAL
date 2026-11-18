// GET /api/cupos?servicioId=…&psicologoId=…&desde=…&hasta=… (E05). Pública, con límite de consultas por dirección de red.
import type { CodigoError } from "../../../contratos/resultado";
import { obtenerCupos } from "../../../servidor/citas/cupos";
import { conRegistro } from "../../../servidor/registro";

const ESTADO: Partial<Record<CodigoError, number>> = {
  VALIDACION: 400,
  SERVICIO_NO_DISPONIBLE: 404,
  DEMASIADOS_INTENTOS: 429,
};

export const GET = conRegistro(async (req: Request) => {
  const p = new URL(req.url).searchParams;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "desconocida";
  const r = await obtenerCupos(
    {
      servicioId: p.get("servicioId") ?? "",
      psicologoId: p.get("psicologoId") || undefined,
      desde: p.get("desde") ?? "",
      hasta: p.get("hasta") ?? "",
    },
    { ip },
  );
  return Response.json(r, { status: r.ok ? 200 : (ESTADO[r.codigo] ?? 500) });
});
