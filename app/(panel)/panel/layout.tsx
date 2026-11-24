import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { Boton } from "@/componentes/panel/controles";
import { cerrarSesionAccion } from "@/servidor/cuentas/acciones";
import { paginaProtegida } from "@/servidor/cuentas/sesionActual";

async function CabeceraPanel() {
  const sesion = await paginaProtegida(["ADMIN", "PSICOLOGO"]);
  const admin = sesion.rol === "ADMIN";
  return (
    <header className="border-b border-borde-suave bg-fondo-superficie">
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <Link href="/panel" className="font-fuerte text-texto-titulo">
          CAPL
        </Link>
        <nav aria-label="Panel" className="flex flex-wrap items-center gap-4">
          {admin && (
            <Link
              href="/panel/admin/equipo"
              className="text-texto-enlace underline"
            >
              Equipo
            </Link>
          )}
          <Link
            href={admin ? "/panel/admin/citas" : "/panel/psicologo/citas"}
            className="text-texto-enlace underline"
          >
            {admin ? "Citas" : "Mis citas"}
          </Link>
          <form action={cerrarSesionAccion}>
            <Boton tono="secundario">Cerrar sesión</Boton>
          </form>
        </nav>
      </div>
    </header>
  );
}

export default function LayoutPanel({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <CabeceraPanel />
      </Suspense>
      <main className="mx-auto grid w-full max-w-[1200px] gap-5 px-4 py-5 sm:px-5 sm:py-6">
        <Suspense fallback={<p role="status">Cargando panel…</p>}>
          {children}
        </Suspense>
      </main>
    </>
  );
}
