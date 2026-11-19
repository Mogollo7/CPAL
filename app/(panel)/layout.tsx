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
  // Obtenemos la sesión real desde la cookie/servidor
  const sesionReal = await obtenerSesion();

  // Guarda de sesión con soporte de sesión simulada para desarrollo (T-111)
  let rol: RolPanel = "ADMIN";
  let usuarioNombre = "Monitora CAPL";

  if (sesionReal) {
    rol = sesionReal.rol;
    usuarioNombre =
      sesionReal.rol === "ADMIN" ? "Administrador CAPL" : "Psicólogo(a) CAPL";
  } else if (process.env.ENTORNO === "produccion") {
    // En producción es estricto: sin sesión redirige a /ingresar
    redirect("/ingresar");
  } else {
    // Modo desarrollo local sin base de datos activa:
    // Permite que Brand maquete y visualice el panel sin bloqueos de Docker (T-111)
    rol = "ADMIN";
    usuarioNombre = "Coordinación (Simulado)";
  }

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
