"use client";

import { useState } from "react";

// Figma · Pie / Consultar mi cita. ponytail: no hay búsqueda por código en el servidor (Figma pide verificar a la
// persona antes de entregar el enlace privado); por ahora orienta al correo. Cuando exista la consulta, enviar aquí.
export function ConsultarCita() {
  const [enviado, setEnviado] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setEnviado(true);
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
          pattern="CAPL-\d{4}"
          required
          className="w-[96px] rounded-s px-2 text-p text-texto-principal placeholder:text-texto-secundario"
        />
        <button
          type="submit"
          className="min-h-[35px] rounded-s bg-morado-100 px-4 text-p font-medio text-accion-fondo hover:bg-morado-300/50"
        >
          Consultar
        </button>
      </div>
      {enviado && (
        <p role="status" className="text-caption">
          Abre el enlace del correo que te enviamos: desde ahí ves, cambias o
          cancelas tu cita.
        </p>
      )}
    </form>
  );
}
