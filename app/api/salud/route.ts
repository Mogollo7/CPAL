// Monitor externo (S06). Responde 200 {"estado":"ok"} si la BD contesta; 503 si no. Sin más detalle.
import { connection } from "next/server";
import { bd } from "@/servidor/bd";
import { conRegistro } from "@/servidor/registro";

export const GET = conRegistro(async () => {
  await connection(); // siempre en vivo, nunca prerenderizada
  try {
    await bd.$queryRaw`SELECT 1`;
    return Response.json({ estado: "ok" });
  } catch {
    return Response.json({ estado: "error" }, { status: 503 });
  }
});
