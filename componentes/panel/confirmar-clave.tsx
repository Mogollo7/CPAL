"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Resultado } from "@/contratos/resultado";
import { confirmarClaveAccion } from "@/servidor/cuentas/acciones";
import { Boton } from "../atomos/boton";
import { Campo } from "../moleculas/campo";

// Acciones sensibles (S02): si el servidor responde CONFIRMACION_REQUERIDA, pide la contraseña en un <dialog>,
// la confirma (vale 10 minutos) y repite la acción. Uso:
//   const { conConfirmacion, dialogo } = useConfirmacion();
//   const r = await conConfirmacion(() => cambiarActivoAccion(...));
//   return <>{dialogo}…</>;
export function useConfirmacion() {
  const ref = useRef<HTMLDialogElement>(null);
  const pendiente = useRef<((ok: boolean) => void) | null>(null);
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  const pedir = () =>
    new Promise<boolean>((resolver) => {
      pendiente.current = resolver;
      setClave("");
      setError(undefined);
      ref.current?.showModal();
    });

  async function conConfirmacion<T>(
    op: () => Promise<Resultado<T>>,
  ): Promise<Resultado<T>> {
    const r = await op();
    if (r.ok || r.codigo !== "CONFIRMACION_REQUERIDA") return r;
    return (await pedir()) ? op() : r;
  }

  const cerrar = (ok: boolean) => {
    ref.current?.close();
    pendiente.current?.(ok);
    pendiente.current = null;
  };

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const datos = new FormData();
    datos.set("clave", clave);
    const r = await confirmarClaveAccion(null, datos);
    setEnviando(false);
    if (r.ok) cerrar(true);
    else setError(r.mensaje);
  }

  const dialogo = (
    <dialog
      ref={ref}
      onCancel={() => cerrar(false)}
      aria-labelledby="titulo-confirmar-clave"
      className="m-auto w-[min(92vw,420px)] rounded-l bg-blanco p-6 text-texto-principal backdrop:bg-texto-principal/40"
    >
      <form onSubmit={enviar} className="space-y-4">
        <h2 id="titulo-confirmar-clave" className="font-titulo text-h2">
          Confirma tu contraseña
        </h2>
        <p className="text-p text-texto-secundario">
          Esta acción es sensible. Tu confirmación vale 10 minutos.
        </p>
        <Campo
          id="confirmar-clave"
          etiqueta="Contraseña"
          type="password"
          autoComplete="current-password"
          required
          valor={clave}
          alCambiar={setClave}
          error={error}
        />
        <div className="flex justify-end gap-2">
          <Boton tipo="borde" type="button" onClick={() => cerrar(false)}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={enviando}>
            {enviando ? "Confirmando…" : "Confirmar"}
          </Boton>
        </div>
      </form>
    </dialog>
  );

  return { conConfirmacion, dialogo };
}
