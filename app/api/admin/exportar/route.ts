// GET /api/admin/exportar?estado=…&desde=… — descarga las citas en CSV (RF-ADM-14). Acción sensible (S02):
// administrador con contraseña confirmada hace menos de 10 minutos; si no, 403 `CONFIRMACION_REQUERIDA`.
import { exportarCitas } from "@/servidor/citas/admin";
import {
  exigirClaveReciente,
  sesionDeOperacion,
} from "@/servidor/cuentas/sesionActual";

const ESTADO_HTTP: Record<string, number> = {
  NO_AUTENTICADO: 401,
  SIN_PERMISO: 403,
  CONFIRMACION_REQUERIDA: 403,
  VALIDACION: 400,
};

export async function GET(req: Request) {
  const s = await sesionDeOperacion("ADMIN");
  const c = s.ok ? await exigirClaveReciente(s.datos) : s;
  const r = c.ok
    ? await exportarCitas(
        c.datos,
        Object.fromEntries(new URL(req.url).searchParams),
      )
    : c;
  if (!r.ok)
    return Response.json(r, {
      status: ESTADO_HTTP[r.codigo] ?? 500,
      headers: { "Cache-Control": "no-store" },
    });
  const hoy = new Date().toLocaleDateString("sv-SE", {
    timeZone: "America/Bogota",
  });
  return new Response(r.datos, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="citas-${hoy}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
