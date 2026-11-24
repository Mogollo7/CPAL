import { Acceso } from "@/componentes/panel/acceso";
import { obtenerSesion } from "@/servidor/cuentas/sesionActual";
import { redirect } from "next/navigation";

export const instant = false;

export default async function PaginaIngreso() {
  if (await obtenerSesion()) redirect("/panel");
  return (
    <>
      <h1 className="text-h1 font-fuerte text-texto-titulo">
        Ingresar al panel
      </h1>
      <Acceso />
    </>
  );
}
