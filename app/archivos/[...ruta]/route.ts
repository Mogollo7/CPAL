// GET /archivos/fotos/<uuid>.webp — sirve las imágenes subidas (fotos de perfil e imágenes de evento).
// Son públicas por diseño; el nombre es aleatorio y cambia al reemplazar la imagen, así que se cachean para siempre.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { CARPETAS, carpetaArchivos } from "@/servidor/archivos";

// Solo `<carpeta conocida>/<uuid>.webp`: cierra el paso a `..`, a otras extensiones y a cualquier otra carpeta.
const RUTA = new RegExp(`^(${CARPETAS.join("|")})/[0-9a-f-]{36}\\.webp$`);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ruta: string[] }> },
) {
  const ruta = (await params).ruta.join("/");
  if (!RUTA.test(ruta)) return new Response(null, { status: 404 });
  try {
    return new Response(await readFile(join(carpetaArchivos(), ruta)), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
