// Avisos de entrega de Resend (S04, T-332). La firma se comprueba en ./firma.
import { bd } from "../bd";
import { registrar } from "../registro";

type Aviso = {
  type?: string;
  data?: {
    to?: string[] | string;
    tags?: Record<string, string> | { name: string; value: string }[];
    bounce?: { type?: string };
  };
};

const etiquetaTrabajo = (a: Aviso): string | undefined => {
  const t = a.data?.tags;
  return Array.isArray(t)
    ? t.find((x) => x.name === "trabajo")?.value
    : t?.trabajo;
};

/** Guarda el resultado de entrega en el trabajo de correo. Un aviso repetido (mismo `id` de Svix) se descarta. */
export async function procesarAviso(
  idAviso: string,
  aviso: Aviso,
  ahora = new Date(),
): Promise<"procesado" | "repetido" | "ignorado"> {
  // El propio aviso se anota como trabajo ya hecho: su llave única es la deduplicación.
  const nuevo = await bd.trabajo.createMany({
    data: [
      {
        tipo: "WEBHOOK_RESEND",
        llave: `webhook:${idAviso}`,
        datos: {},
        estado: "HECHO",
        hechoEn: ahora,
      },
    ],
    skipDuplicates: true,
  });
  if (!nuevo.count) return "repetido";

  const entregado =
    aviso.type === "email.delivered"
      ? true
      : aviso.type === "email.complained" ||
          (aviso.type === "email.bounced" &&
            aviso.data?.bounce?.type !== "Transient")
        ? false // rebote permanente (o indeterminado) o marcado como no deseado
        : undefined;
  // Marcó un correo del CAPL como no deseado: no se le vuelve a escribir (S04). `prepararCorreo` consulta esta lista.
  if (aviso.type === "email.complained") {
    const para = [aviso.data?.to ?? []].flat().map((c) => c.toLowerCase());
    if (para.length)
      await bd.correoSuprimido.createMany({
        data: para.map((correo) => ({ correo, motivo: "no-deseado" })),
        skipDuplicates: true,
      });
  }
  const trabajoId = etiquetaTrabajo(aviso);
  if (entregado === undefined || !trabajoId) return "ignorado";

  const r = await bd.trabajo.updateMany({
    where: { id: trabajoId, tipo: "CORREO" },
    data: { entregado },
  });
  if (r.count && !entregado)
    registrar("externo.llamada", {
      nivel: "aviso",
      servicio: "resend",
      operacion: "rebote",
      resultado: aviso.type,
    });
  return "procesado";
}
