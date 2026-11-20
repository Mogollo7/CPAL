"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Boton } from "@/componentes/atomos/boton";
import { Titulo } from "@/componentes/atomos/titulo";
import { CLASE_CONTROL } from "@/componentes/moleculas/campo";
import { SIN_CONEXION } from "@/contratos/resultado";
import { cambiarClaveAccion } from "@/servidor/cuentas/acciones";
import { TarjetaPanel } from "../tarjeta-panel";

export function FormularioCuentaAdmin() {
  const [error, setError] = useState<string>();
  const [guardada, setGuardada] = useState(false);
  const [pendiente, iniciar] = useTransition();

  function cambiar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);
    setError(undefined);
    setGuardada(false);
    if (datos.get("claveNueva") !== datos.get("confirmacion")) {
      setError("La confirmación de la contraseña no coincide.");
      return;
    }
    datos.delete("confirmacion");
    iniciar(async () => {
      try {
        const resultado = await cambiarClaveAccion(null, datos);
        if (!resultado.ok) {
          setError(resultado.mensaje);
          return;
        }
        formulario.reset();
        setGuardada(true);
      } catch {
        setError(SIN_CONEXION);
      }
    });
  }

  return (
    <TarjetaPanel className="max-w-xl">
      <Titulo tamano="tarjeta" id="titulo-cambiar-clave">
        Cambiar contraseña
      </Titulo>
      <p className="mt-2 text-texto-secundario">
        Usa al menos 10 caracteres y evita que coincida con tu correo.
      </p>
      <form
        aria-labelledby="titulo-cambiar-clave"
        onSubmit={cambiar}
        className="mt-4 space-y-4"
      >
        <fieldset disabled={pendiente} className="space-y-4">
          <label className="block space-y-1">
            Contraseña actual{" "}
            <input
              className={CLASE_CONTROL}
              name="claveActual"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <label className="block space-y-1">
            Nueva contraseña{" "}
            <input
              className={CLASE_CONTROL}
              name="claveNueva"
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
            />
          </label>
          <label className="block space-y-1">
            Repite la nueva contraseña{" "}
            <input
              className={CLASE_CONTROL}
              name="confirmacion"
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
            />
          </label>
        </fieldset>
        {error && (
          <p role="alert" className="text-error-texto">
            {error}
          </p>
        )}
        {guardada && (
          <p role="status" className="text-exito-texto">
            Tu contraseña se actualizó.
          </p>
        )}
        <Boton type="submit" disabled={pendiente}>
          {pendiente ? "Actualizando…" : "Actualizar contraseña"}
        </Boton>
      </form>
    </TarjetaPanel>
  );
}
