// Medición de uso anónima (S07, T-513). Responde siempre 204: si algo falla, el sitio no se entera.
import { procesarMedicion } from "@/servidor/medicion/medir";
import { textoLimitado } from "@/servidor/cuerpoLimitado";

export async function POST(req: Request) {
  try {
    if (process.env.MEDICION !== "si")
      return new Response(null, { status: 204 });
    const texto = await textoLimitado(req, 8 * 1024);
    if (texto === null) return new Response(null, { status: 413 });
    procesarMedicion({
      activo: process.env.MEDICION === "si", // SUPUESTO(P-24): apagada por defecto hasta que la universidad apruebe
      texto,
      cabeceras: req.headers,
    });
  } catch {
    // nada: la medición nunca debe afectar al sitio
  }
  return new Response(null, { status: 204 });
}
