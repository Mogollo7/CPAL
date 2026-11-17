// Medición de uso anónima (S07, T-513). Responde siempre 204: si algo falla, el sitio no se entera.
import { procesarMedicion } from "@/servidor/medicion/medir";

export async function POST(req: Request) {
  try {
    procesarMedicion({
      activo: process.env.MEDICION === "si", // SUPUESTO(P-24): apagada por defecto hasta que la universidad apruebe
      texto: await req.text(),
      cabeceras: req.headers,
    });
  } catch {
    // nada: la medición nunca debe afectar al sitio
  }
  return new Response(null, { status: 204 });
}
