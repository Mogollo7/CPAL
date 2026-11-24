import { Suspense, type ReactNode } from "react";

export default function LayoutAcceso({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md content-center px-4 py-6">
      <div className="grid gap-4 rounded-l border border-borde-suave bg-fondo-superficie p-5 shadow-flotante sm:p-6">
        <Suspense fallback={<p role="status">Cargando acceso…</p>}>
          {children}
        </Suspense>
      </div>
    </main>
  );
}
