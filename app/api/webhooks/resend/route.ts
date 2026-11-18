// Avisos de entrega de Resend (S04, T-332). Firma inválida → 401. Firma válida → siempre 200 (Resend no reintenta por nuestros errores de datos).
import { firmaValida } from "@/servidor/correo/firma";
import { procesarAviso } from "@/servidor/correo/webhook";
import { conRegistro, registrar } from "@/servidor/registro";

export const POST = conRegistro(async (req) => {
  const cuerpo = await req.text();
  const id = req.headers.get("svix-id") ?? "";
  const ok = firmaValida(
    {
      id,
      marca: req.headers.get("svix-timestamp") ?? "",
      firma: req.headers.get("svix-signature") ?? "",
    },
    cuerpo,
    process.env.RESEND_WEBHOOK_SECRET ?? "",
  );
  if (!ok) {
    registrar("webhook.firma_invalida", { nivel: "aviso", servicio: "resend" });
    return Response.json({ error: "firma inválida" }, { status: 401 });
  }
  let aviso = {};
  try {
    aviso = JSON.parse(cuerpo);
  } catch {}
  const r = await procesarAviso(id, aviso);
  registrar("webhook.recibido", { servicio: "resend", resultado: r });
  return Response.json({ ok: true });
});
