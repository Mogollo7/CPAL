/** Limita los bytes leídos incluso si la petición no declara su longitud. */
export async function textoLimitado(req: Request, maxBytes: number) {
  if (Number(req.headers.get("content-length")) > maxBytes) return null;
  const lector = req.body?.getReader();
  if (!lector) return "";
  const decodificador = new TextDecoder();
  let bytes = 0;
  let texto = "";
  try {
    for (;;) {
      const { done, value } = await lector.read();
      if (done) return texto + decodificador.decode();
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await lector.cancel();
        return null;
      }
      texto += decodificador.decode(value, { stream: true });
    }
  } finally {
    lector.releaseLock();
  }
}
