"use client";

import { SelectorCupo } from "@/componentes/publico/selector-cupo";
import { EncabezadoPaso, Navegacion, type PropsPaso } from "./piezas";

export function PasoHorario({
  datos,
  cambiar,
  aviso,
  alVolver,
  alSeguir,
}: PropsPaso & {
  aviso: string | null; // p. ej. «ese horario ya fue tomado» al volver del envío
  alVolver: () => void;
  alSeguir: () => void;
}) {
  return (
    <div className="space-y-6">
      <EncabezadoPaso paso={3} titulo="Profesional y horario">
        Solo te mostramos horarios que de verdad están libres.
      </EncabezadoPaso>

      {aviso && (
        <p
          role="alert"
          className="p-4 rounded-m bg-aviso-fondo text-tinta text-caption"
        >
          {aviso}
        </p>
      )}

      <SelectorCupo
        servicioId={datos.servicioId}
        psicologoId={datos.psicologoId}
        inicio={datos.inicio}
        recargar={aviso ?? ""}
        alCambiar={cambiar}
      />

      <Navegacion
        alVolver={alVolver}
        alSeguir={alSeguir}
        puedeSeguir={Boolean(datos.inicio)}
        texto="Continuar a tus datos"
      />
    </div>
  );
}
