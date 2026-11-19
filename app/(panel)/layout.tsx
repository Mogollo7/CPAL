import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { BarraLateral, type RolPanel } from "@/componentes/panel/barra-lateral";
import { CabeceraPanel } from "@/componentes/panel/cabecera-panel";
import { obtenerSesion } from "@/servidor/cuentas/sesionActual";

export const instant = false;

export default async function LayoutPanel({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  // proxy.ts ya corta /panel sin cookie; aquí se comprueba en BD que la cuenta siga activa.
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/ingresar");
  const rol: RolPanel = sesion.rol;
  const usuarioNombre =
    rol === "ADMIN" ? "Administrador CAPL" : "Psicólogo(a) CAPL";

  return (
    <div className="min-h-screen bg-fondo-pagina text-texto-principal flex">
      {/* Barra lateral fija (260px) */}
      <BarraLateral rol={rol} usuarioNombre={usuarioNombre} />

      {/* Contenedor principal con margen izquierdo para compensar la barra lateral fija */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        {/* Cabecera superior */}
        <CabeceraPanel usuarioNombre={usuarioNombre} rol={rol} />

        {/* Área de contenido de las pantallas del panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
