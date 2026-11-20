"use client";

import { useState } from "react";
import { SIN_CONEXION } from "@/contratos/resultado";
import { consultarCitaAccion } from "@/servidor/acciones";

// Figma · Pie / Consultar mi cita. Verifica a la persona sin mostrar la cita: si el código existe, el enlace privado
// llega al correo con el que se pidió; la respuesta es la misma exista o no (servidor/citas/consulta.ts).
export function ConsultarCita() {
  const [aviso, setAviso] = useState<string>();
  const [error, setError] = useState(false);
  const [enviando, setEnviando] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const codigo = new FormData(e.currentTarget).get("codigo");
        setEnviando(true);
        try {
          const r = await consultarCitaAccion(String(codigo));
          setError(!r.ok);
          setAviso(r.ok ? r.datos.mensaje : r.mensaje);
        } catch {
          setError(true);
          setAviso(SIN_CONEXION);
        } finally {
          setEnviando(false);
        }
      }}
      className="space-y-2"
    >
      <label htmlFor="codigo-cita" className="block text-h2 font-medio">
        Consultar mi cita
      </label>
      <div className="flex w-fit gap-2 rounded-s bg-blanco p-1">
        <input
          id="codigo-cita"
          name="codigo"
          placeholder="CAPL-0000"
          pattern="[Cc][Aa][Pp][Ll]-[A-Za-z0-9]{4}"
          autoCapitalize="characters"
          autoComplete="off"
          required
          className="w-[96px] rounded-s px-2 text-p uppercase text-texto-principal placeholder:text-texto-secundario"
        />
        <button
          type="submit"
          disabled={enviando}
          className="min-h-[35px] rounded-s bg-morado-100 px-4 text-p font-medio text-accion-fondo hover:bg-morado-300/50 disabled:opacity-60"
        >
          {enviando ? "Enviando…" : "Consultar"}
        </button>
      </div>
      {aviso && (
        <p
          role={error ? "alert" : "status"}
          className="max-w-[320px] text-caption"
        >
          {aviso}
        </p>
      )}
    </form>
  );
}
