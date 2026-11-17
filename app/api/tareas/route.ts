// La tarea programada (S05, T-321). El servicio `tareas` la llama cada minuto con `Authorization: Bearer ${CRON_SECRET}`.
import { createHash, timingSafeEqual } from "node:crypto";
import { ejecutarTareas } from "@/servidor/tareas";
import { conRegistro } from "@/servidor/registro";

const hash = (s: string) => createHash("sha256").update(s).digest();

export const POST = conRegistro(async (req) => {
  const secreto = process.env.CRON_SECRET ?? "";
  const dado = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
  // Sin CRON_SECRET configurado nadie entra. Se compara el hash para no filtrar la longitud ni el contenido.
  if (!secreto || !timingSafeEqual(hash(dado), hash(secreto)))
    return Response.json({ error: "no autorizado" }, { status: 401 });
  const resumen = await ejecutarTareas();
  return Response.json(resumen ?? { omitida: true }); // omitida: otra vuelta sigue en curso
});
