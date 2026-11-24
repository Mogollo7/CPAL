"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import type { UsuarioResumen } from "@/contratos/psicologo";
import { SIN_CONEXION } from "@/contratos/resultado";
import { cambiarActivoAccion } from "@/servidor/acciones";
import { ModalAccionCita } from "../citas/modal-accion-cita";
import { useConfirmacion } from "../confirmar-clave";

export function CambioEstadoUsuario({
  usuario,
  alCerrar,
  alGuardar,
}: {
  usuario: UsuarioResumen;
  alCerrar: () => void;
  alGuardar: (usuario: UsuarioResumen) => void;
}) {
  const { conConfirmacion, dialogo } = useConfirmacion();
  const contenedor = useRef<HTMLDivElement>(null);
  const activar = usuario.estado === "INACTIVO";
  const verbo = activar ? "Activar" : "Desactivar";
  const efecto =
    usuario.rol === "ADMIN"
      ? activar
        ? "Podrá volver a acceder al panel de administración."
        : "Perderá el acceso al panel de administración."
      : activar
        ? "Podrá volver a acceder al panel y ofrecer citas según su disponibilidad."
        : "Perderá el acceso al panel y dejará de recibir nuevas citas.";

  useEffect(() => {
    const origen = document.activeElement;
    contenedor.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => {
      if (origen instanceof HTMLElement) origen.focus();
    };
  }, []);

  function manejarTecla(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key === "Escape") {
      evento.preventDefault();
      evento.currentTarget.querySelector<HTMLButtonElement>("button")?.click();
    }
    if (evento.key !== "Tab") return;
    const botones = evento.currentTarget.querySelectorAll<HTMLButtonElement>(
      "button:not(:disabled)",
    );
    const primero = botones[0];
    const ultimo = botones[botones.length - 1];
    if (
      !primero ||
      (evento.shiftKey ? evento.target === primero : evento.target === ultimo)
    ) {
      evento.preventDefault();
      (evento.shiftKey ? ultimo : primero)?.focus();
    }
  }

  return (
    <>
      <div
        ref={contenedor}
        onKeyDown={manejarTecla}
        className="[&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-foco"
      >
        <ModalAccionCita
          abierto
          alCerrar={alCerrar}
          titulo={`${verbo} a ${usuario.nombre}`}
          descripcion={efecto}
          textoBoton={verbo}
          variante={activar ? "primario" : "peligro"}
          alConfirmar={async () => {
            try {
              const resultado = await conConfirmacion(() =>
                cambiarActivoAccion({ id: usuario.id, activo: activar }),
              );
              if (resultado.ok) alGuardar(resultado.datos);
              return resultado;
            } catch {
              return { ok: false, mensaje: SIN_CONEXION };
            }
          }}
        />
      </div>
      {dialogo}
    </>
  );
}
