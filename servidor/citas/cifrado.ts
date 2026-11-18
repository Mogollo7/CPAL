// Cifrado del motivo de consulta (S03, T-336): AES-256-GCM con llave versionada.
// CLAVE_CIFRADO = "2:<base64 de 32 bytes>,1:<base64 de 32 bytes>": la primera cifra; todas sirven para leer.
// Una llave sin prefijo cuenta como versión 1. Nunca se borra una llave mientras existan datos cifrados con ella (S08).
// Valor guardado: "v{versión}.{iv}.{etiqueta}.{cifrado}" en base64url.
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function llaves(): Map<number, Buffer> {
  const mapa = new Map<number, Buffer>();
  for (const parte of (process.env.CLAVE_CIFRADO ?? "")
    .split(",")
    .filter(Boolean)) {
    const [a, b] = parte.includes(":") ? parte.split(":") : ["1", parte];
    const llave = Buffer.from(b.trim(), "base64");
    if (llave.length !== 32)
      throw new Error("CLAVE_CIFRADO debe ser de 32 bytes en base64");
    mapa.set(Number(a), llave);
  }
  if (!mapa.size) throw new Error("Falta CLAVE_CIFRADO");
  return mapa;
}

export function cifrar(texto: string): string {
  const [version, llave] = [...llaves()][0]; // la primera es la vigente
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", llave, iv);
  const datos = Buffer.concat([c.update(texto, "utf8"), c.final()]);
  return ["v" + version, iv, c.getAuthTag(), datos]
    .map((x) => (typeof x === "string" ? x : x.toString("base64url")))
    .join(".");
}

/** Lanza si la llave de esa versión falta o el valor fue alterado (GCM lo detecta). */
export function descifrar(valor: string): string {
  const [v, iv, etiqueta, datos] = valor.split(".");
  const llave = llaves().get(Number(v?.slice(1)));
  if (!llave || !iv || !etiqueta || datos === undefined)
    throw new Error("Valor cifrado no válido");
  const d = createDecipheriv(
    "aes-256-gcm",
    llave,
    Buffer.from(iv, "base64url"),
  );
  d.setAuthTag(Buffer.from(etiqueta, "base64url"));
  return Buffer.concat([
    d.update(Buffer.from(datos, "base64url")),
    d.final(),
  ]).toString("utf8");
}
