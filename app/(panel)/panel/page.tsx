import { redirect } from "next/navigation";
import { paginaProtegida } from "@/servidor/cuentas/sesionActual";

export const instant = false;

export default async function InicioPanel() {
  const sesion = await paginaProtegida(["ADMIN", "PSICOLOGO"]);
  redirect(
    sesion.rol === "ADMIN" ? "/panel/admin/equipo" : "/panel/psicologo/citas",
  );
}
