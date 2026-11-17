// Imágenes subidas (fotos de perfil, imágenes de evento): se validan por cabecera binaria, se reprocesan a WebP sin
// metadatos y se guardan con nombre aleatorio bajo RUTA_ARCHIVOS. La ruta pública /archivos/… las sirve (E03 §11).
import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

/** Carpetas de imágenes que existen; la ruta pública solo sirve estas. */
export const CARPETAS = ["fotos", "eventos"] as const;
export type Carpeta = (typeof CARPETAS)[number];

// SUPUESTO: carpeta local por defecto; en el servidor la fija RUTA_ARCHIVOS (E01).
export const carpetaArchivos = () => process.env.RUTA_ARCHIVOS ?? "./archivos";
export const urlArchivo = (ruta: string | null) =>
  ruta ? `/archivos/${ruta}` : null;

/** Verifica por cabecera binaria (no por extensión) que sea JPG, PNG o WebP. */
export function esImagenPermitida(b: Uint8Array): boolean {
  const jpg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
    (x, i) => b[i] === x,
  );
  const webp =
    String.fromCharCode(...b.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...b.slice(8, 12)) === "WEBP";
  return jpg || png || webp;
}

/** Recorta a `ancho × alto`, convierte a WebP y guarda. Devuelve la ruta relativa (`fotos/<uuid>.webp`) o `null`
 *  si el archivo falta, pesa más de `maxBytes`, no es una imagen permitida o está corrupto. */
export async function guardarImagen(
  archivo: Uint8Array,
  carpeta: Carpeta,
  { ancho, alto, maxBytes }: { ancho: number; alto: number; maxBytes: number },
): Promise<string | null> {
  if (
    !archivo?.byteLength ||
    archivo.byteLength > maxBytes ||
    !esImagenPermitida(archivo)
  )
    return null;
  let salida: Buffer;
  try {
    const sharp = (await import("sharp")).default;
    // `rotate()` aplica la orientación EXIF; sharp quita los metadatos al reprocesar.
    salida = await sharp(archivo)
      .rotate()
      .resize(ancho, alto, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return null; // cabecera válida pero imagen corrupta
  }
  const ruta = `${carpeta}/${randomUUID()}.webp`;
  await mkdir(join(carpetaArchivos(), carpeta), { recursive: true });
  await writeFile(join(carpetaArchivos(), ruta), salida);
  return ruta;
}

export const borrarArchivo = (ruta: string | null | undefined) =>
  ruta ? rm(join(carpetaArchivos(), ruta), { force: true }) : undefined;
