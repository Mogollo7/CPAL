"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Users } from "lucide-react";
import { Boton } from "@/componentes/atomos/boton";
import { Etiqueta } from "@/componentes/atomos/etiqueta";
import { Titulo } from "@/componentes/atomos/titulo";
import { Campo } from "@/componentes/moleculas/campo";
import type { UsuarioResumen } from "@/contratos/psicologo";
import { SIN_CONEXION } from "@/contratos/resultado";
import { crearAdministradorAccion } from "@/servidor/acciones";
import { useConfirmacion } from "../confirmar-clave";
import { EstadoVacio } from "../estado-vacio";
import { TarjetaPanel } from "../tarjeta-panel";
import { CambioEstadoUsuario } from "./cambio-estado-usuario";

const estados = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  INVITADO: "Invitado",
};

export function GestorAdministradores({
  iniciales,
}: {
  iniciales: UsuarioResumen[];
}) {
  const [usuarios, setUsuarios] = useState(iniciales);
  const [objetivo, setObjetivo] = useState<UsuarioResumen>();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState<string>();
  const [aviso, setAviso] = useState<string>();
  const [pendiente, iniciar] = useTransition();
  const { conConfirmacion, dialogo } = useConfirmacion();

  function invitar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(undefined);
    setAviso(undefined);
    iniciar(async () => {
      try {
        const resultado = await conConfirmacion(() =>
          crearAdministradorAccion({ nombre, correo }),
        );
        if (!resultado.ok) {
          setError(resultado.mensaje);
          return;
        }
        setUsuarios((prev) => [...prev, resultado.datos]);
        setNombre("");
        setCorreo("");
        setAviso(`Invitación preparada para ${resultado.datos.correo}.`);
      } catch {
        setError(SIN_CONEXION);
      }
    });
  }

  return (
    <div className="space-y-4">
      {objetivo ? (
        <CambioEstadoUsuario
          usuario={objetivo}
          alCerrar={() => setObjetivo(undefined)}
          alGuardar={(usuario) => {
            setUsuarios((prev) =>
              prev.map((item) => (item.id === usuario.id ? usuario : item)),
            );
            setAviso(
              usuario.estado === "ACTIVO"
                ? "Cuenta activada."
                : "Cuenta desactivada.",
            );
          }}
        />
      ) : (
        dialogo
      )}
      {aviso && (
        <p role="status" className="text-exito-texto">
          {aviso}
        </p>
      )}
      <TarjetaPanel>
        <Titulo tamano="tarjeta" id="alta-administrador">
          Invitar administrador
        </Titulo>
        <p className="mt-2 text-texto-secundario">
          La persona recibirá un enlace para crear su contraseña y acceder al
          panel de administración.
        </p>
        <form
          aria-labelledby="alta-administrador"
          onSubmit={invitar}
          className="mt-4 space-y-4"
        >
          <fieldset
            disabled={pendiente || Boolean(objetivo)}
            className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-4"
          >
            <Campo
              id="admin-nombre"
              etiqueta="Nombre completo"
              autoComplete="off"
              valor={nombre}
              alCambiar={setNombre}
              required
            />
            <Campo
              id="admin-correo"
              etiqueta="Correo institucional"
              type="email"
              autoComplete="off"
              valor={correo}
              alCambiar={setCorreo}
              required
            />
          </fieldset>
          {error && (
            <p role="alert" className="text-error-texto">
              {error}
            </p>
          )}
          <Boton type="submit" disabled={pendiente || Boolean(objetivo)}>
            {pendiente ? "Preparando invitación…" : "Invitar administrador"}
          </Boton>
        </form>
      </TarjetaPanel>
      {usuarios.length === 0 ? (
        <EstadoVacio
          icono={Users}
          titulo="Aún no hay administradores"
          descripcion="Las cuentas invitadas aparecerán aquí."
        />
      ) : (
        <ul className="space-y-3">
          {usuarios.map((usuario) => (
            <li key={usuario.id}>
              <TarjetaPanel className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 space-y-2 wrap-break-word">
                  <Titulo tamano="tarjeta">{usuario.nombre}</Titulo>
                  <p className="text-texto-secundario">{usuario.correo}</p>
                  <Etiqueta>{estados[usuario.estado]}</Etiqueta>
                </div>
                {usuario.estado !== "INVITADO" && (
                  <Boton
                    tipo="borde"
                    disabled={pendiente}
                    aria-label={`${usuario.estado === "ACTIVO" ? "Desactivar" : "Activar"} a ${usuario.nombre}`}
                    onClick={() => {
                      setAviso(undefined);
                      setObjetivo(usuario);
                    }}
                  >
                    {usuario.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                  </Boton>
                )}
              </TarjetaPanel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
