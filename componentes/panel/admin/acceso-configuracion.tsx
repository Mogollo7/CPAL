"use client";

import { useState, useTransition } from "react";
import { LockKeyhole } from "lucide-react";
import type { Configuracion } from "@/contratos/configuracion";
import { SIN_CONEXION } from "@/contratos/resultado";
import { obtenerConfiguracionAccion } from "@/servidor/acciones";
import { Boton } from "@/componentes/atomos/boton";
import { EstadoVacio } from "../estado-vacio";
import { useConfirmacion } from "../confirmar-clave";
import { FormularioConfiguracion } from "./formulario-configuracion";

export function AccesoConfiguracion({ inicial }: { inicial?: Configuracion }) {
  const [configuracion, setConfiguracion] = useState(inicial);
  const [error, setError] = useState<string>();
  const [pendiente, iniciar] = useTransition();
  const { conConfirmacion, dialogo } = useConfirmacion();

  if (configuracion)
    return <FormularioConfiguracion configuracionInicial={configuracion} />;

  return (
    <div className="space-y-3">
      <EstadoVacio
        icono={LockKeyhole}
        titulo="Confirma tu contraseña para ver la configuración"
        descripcion="Así protegemos las reglas de atención y acceso del centro."
        accion={
          <Boton
            disabled={pendiente}
            onClick={() => {
              setError(undefined);
              iniciar(async () => {
                try {
                  const resultado = await conConfirmacion(() =>
                    obtenerConfiguracionAccion(),
                  );
                  if (resultado.ok) setConfiguracion(resultado.datos);
                  else setError(resultado.mensaje);
                } catch {
                  setError(SIN_CONEXION);
                }
              });
            }}
          >
            {pendiente ? "Abriendo configuración…" : "Confirmar contraseña"}
          </Boton>
        }
      />
      {error && (
        <p role="alert" className="text-error-texto">
          {error}
        </p>
      )}
      {dialogo}
    </div>
  );
}
