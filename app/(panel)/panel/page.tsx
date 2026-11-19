import { redirect } from "next/navigation";
import { connection } from "next/server";
import { obtenerSesion } from "@/servidor/cuentas/sesionActual";

export default async function PaginaPrincipalPanel() {
  await connection();
  const sesion = await obtenerSesion();

  if (sesion?.rol === "PSICOLOGO") {
    redirect("/panel/psicologo/citas");
  }

  redirect("/panel/admin/citas");
}
