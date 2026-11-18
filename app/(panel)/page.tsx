import { redirect } from "next/navigation";
import { obtenerSesion } from "@/servidor/cuentas/sesionActual";

export default async function PaginaPrincipalPanel() {
  const sesion = await obtenerSesion();

  if (sesion?.rol === "PSICOLOGO") {
    redirect("/panel/psicologo/citas");
  }

  redirect("/panel/admin/citas");
}
