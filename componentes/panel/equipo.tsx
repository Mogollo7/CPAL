"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import type { UsuarioResumen } from "@/contratos/psicologo";
import type { Resultado } from "@/contratos/resultado";
import {
  cambiarActivoAccion,
  crearAdministradorAccion,
  crearPsicologoAccion,
  limpiarCuentasDePruebaAccion,
  reenviarInvitacionAccion,
} from "@/servidor/acciones";
import { confirmarClaveAccion } from "@/servidor/cuentas/acciones";
import { Aviso, Boton, Campo, Superficie } from "./controles";

type Usuario = UsuarioResumen & { prueba: boolean; protegido: boolean };
type Operacion = () => Promise<Resultado<string>>;
type Confirmacion = {
  titulo: string;
  detalle: string;
  ejecutar: Operacion;
  peligro?: boolean;
};
const estados = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  INVITADO: "Invitación pendiente",
};

function ListaCuentas({
  cuentas,
  gestionar,
  eliminarPruebas,
  ocupado,
  alCambiar,
  alEliminar,
  alReenviar,
}: {
  cuentas: Usuario[];
  gestionar: boolean;
  eliminarPruebas: boolean;
  ocupado: boolean;
  alCambiar: (u: Usuario) => void;
  alEliminar: (u: Usuario) => void;
  alReenviar: (u: Usuario) => void;
}) {
  if (!cuentas.length)
    return (
      <p className="text-texto-secundario">Aún no hay cuentas en esta lista.</p>
    );
  return (
    <ul className="divide-y divide-borde-suave">
      {cuentas.map((u) => {
        const editable = !u.protegido && (gestionar || u.rol === "PSICOLOGO");
        return (
          <li
            key={u.id}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between"
          >
            <div className="min-w-0">
              <p className="break-words font-fuerte">{u.nombre}</p>
              <p className="break-all text-texto-secundario">{u.correo}</p>
              <p className="text-caption text-texto-secundario">
                {[
                  u.protegido && "Superusuario",
                  u.area === "PSICOLOGIA" && "Psicología",
                  u.area === "NEUROPSICOLOGIA" && "Neuropsicología",
                  estados[u.estado],
                  u.prueba && "Cuenta de prueba",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            {editable && (
              <div className="flex flex-wrap gap-3">
                {u.estado === "INVITADO" && (
                  <Boton
                    type="button"
                    tono="secundario"
                    onClick={() => alReenviar(u)}
                    disabled={ocupado}
                  >
                    Reenviar invitación
                  </Boton>
                )}
                <Boton
                  type="button"
                  tono="secundario"
                  onClick={() => alCambiar(u)}
                  disabled={ocupado}
                >
                  {u.estado === "INACTIVO" ? "Reactivar" : "Desactivar"}
                </Boton>
                {eliminarPruebas && u.prueba && (
                  <Boton
                    type="button"
                    tono="peligro"
                    onClick={() => alEliminar(u)}
                    disabled={ocupado}
                  >
                    Eliminar
                  </Boton>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function FormularioInvitacion({
  puedeCrearAdmin,
  puedeCrearPruebas,
  ocupado,
  alInvitar,
}: {
  puedeCrearAdmin: boolean;
  puedeCrearPruebas: boolean;
  ocupado: boolean;
  alInvitar: (datos: FormData, formulario: HTMLFormElement) => void;
}) {
  const [admin, setAdmin] = useState(false);
  const estiloSelect =
    "rounded-s border border-borde-control bg-fondo-superficie px-3 py-3";
  return (
    <form
      className="grid gap-4"
      onSubmit={(evento) => {
        evento.preventDefault();
        alInvitar(new FormData(evento.currentTarget), evento.currentTarget);
      }}
    >
      {puedeCrearAdmin && (
        <label className="grid gap-2 font-medio">
          Rol
          <select
            name="rol"
            value={admin ? "ADMIN" : "PSICOLOGO"}
            className={estiloSelect}
            onChange={(evento) => setAdmin(evento.target.value === "ADMIN")}
          >
            <option value="PSICOLOGO">Psicólogo</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </label>
      )}
      <Campo
        etiqueta="Nombre completo"
        name="nombre"
        autoComplete="off"
        minLength={3}
        maxLength={80}
        required
      />
      <Campo
        etiqueta="Correo de la cuenta"
        name="correo"
        type="email"
        autoComplete="off"
        maxLength={120}
        required
      />
      {!admin && (
        <label className="grid gap-2 font-medio">
          Área
          <select name="area" className={estiloSelect} required>
            <option value="PSICOLOGIA">Psicología</option>
            <option value="NEUROPSICOLOGIA">Neuropsicología</option>
          </select>
        </label>
      )}
      {puedeCrearPruebas && (
        <label className="flex min-h-[44px] items-center gap-3">
          <input name="prueba" type="checkbox" /> Marcar como cuenta de prueba
        </label>
      )}
      <Boton disabled={ocupado}>
        {admin ? "Crear administrador" : "Invitar psicólogo"}
      </Boton>
    </form>
  );
}

export function Equipo({
  administradores,
  psicologos,
  adminHabilitado,
  limpiezaHabilitada,
}: {
  administradores: Usuario[];
  psicologos: Usuario[];
  adminHabilitado: boolean;
  limpiezaHabilitada: boolean;
}) {
  const router = useRouter();
  const dialogo = useRef<HTMLDialogElement>(null);
  const cancelar = useRef<HTMLButtonElement>(null);
  const tituloDialogo = useId();
  const detalleDialogo = useId();
  const [confirmacion, setConfirmacion] = useState<Confirmacion>();
  const [aviso, setAviso] = useState<{ mensaje: string; error: boolean }>();
  const [errorDialogo, setErrorDialogo] = useState<string>();
  const [ocupado, setOcupado] = useState(false);
  const cantidadPruebas = [...administradores, ...psicologos].filter(
    (u) => u.prueba && !u.protegido,
  ).length;

  function confirmar(accion: Confirmacion) {
    flushSync(() => {
      setErrorDialogo(undefined);
      setConfirmacion(accion);
    });
    dialogo.current?.showModal();
    cancelar.current?.focus();
  }

  async function ejecutar(operacion: Operacion, datosConfirmacion?: FormData) {
    setOcupado(true);
    setAviso(undefined);
    setErrorDialogo(undefined);
    const mostrarError = (mensaje: string) =>
      datosConfirmacion
        ? setErrorDialogo(mensaje)
        : setAviso({ mensaje, error: true });
    try {
      if (datosConfirmacion) {
        const clave = await confirmarClaveAccion(null, datosConfirmacion);
        if (!clave.ok) return mostrarError(clave.mensaje);
      }
      const r = await operacion();
      if (!r.ok)
        return mostrarError(
          [r.mensaje, r.campos?.citas].filter(Boolean).join(" "),
        );
      dialogo.current?.close();
      setAviso({ mensaje: r.datos, error: false });
      router.refresh();
    } catch {
      mostrarError("No pudimos completar la operación. Inténtalo de nuevo.");
    } finally {
      setOcupado(false);
    }
  }

  function invitar(datos: FormData, formulario: HTMLFormElement) {
    const admin = datos.get("rol") === "ADMIN";
    const prueba = datos.has("prueba");
    const entrada = {
      nombre: datos.get("nombre"),
      correo: datos.get("correo"),
      area: datos.get("area"),
    };
    const operacion = async () => {
      const r = await (admin ? crearAdministradorAccion : crearPsicologoAccion)(
        entrada,
        prueba,
      );
      if (!r.ok) return r;
      formulario.reset();
      return {
        ok: true as const,
        datos: `Cuenta creada. La invitación para ${r.datos.correo} quedó en la cola de envío.`,
      };
    };
    if (admin || prueba)
      confirmar({
        titulo: admin ? "Crear administrador" : "Invitar psicólogo de prueba",
        detalle: `Se creará una cuenta para ${entrada.correo}.`,
        ejecutar: operacion,
      });
    else void ejecutar(operacion);
  }

  const acciones = {
    gestionar: adminHabilitado,
    eliminarPruebas: limpiezaHabilitada,
    ocupado,
    alReenviar: (u: Usuario) =>
      void ejecutar(async () => {
        const r = await reenviarInvitacionAccion(u.id);
        return r.ok
          ? {
              ok: true,
              datos: "La nueva invitación quedó en la cola de envío.",
            }
          : r;
      }),
    alCambiar: (u: Usuario) => {
      const activo = u.estado === "INACTIVO";
      confirmar({
        titulo: activo ? "Reactivar cuenta" : "Desactivar cuenta",
        detalle: activo
          ? `${u.nombre} volverá a tener acceso.`
          : `${u.nombre} perderá el acceso. Sus citas e historial se conservarán.`,
        ejecutar: async () => {
          const r = await cambiarActivoAccion({ id: u.id, activo });
          return r.ok
            ? {
                ok: true,
                datos: activo ? "Cuenta reactivada." : "Cuenta desactivada.",
              }
            : r;
        },
      });
    },
    alEliminar: (u: Usuario) =>
      confirmar({
        titulo: "Eliminar cuenta de prueba",
        detalle: `Se eliminarán la cuenta de ${u.nombre} y sus registros de acceso si no tiene citas asociadas.`,
        peligro: true,
        ejecutar: async () => {
          const r = await limpiarCuentasDePruebaAccion(u.id);
          return r.ok ? { ok: true, datos: "Cuenta de prueba eliminada." } : r;
        },
      }),
  };

  function limpiar() {
    confirmar({
      titulo: "Limpiar cuentas de prueba",
      detalle:
        "Se eliminarán las cuentas marcadas como prueba que no tengan citas y sus registros de acceso. Los datos de ejemplo se conservan.",
      peligro: true,
      ejecutar: async () => {
        const r = await limpiarCuentasDePruebaAccion();
        if (!r.ok) return r;
        const { eliminadas, conCitas } = r.datos;
        const bajas =
          eliminadas === 1
            ? "Se eliminó 1 cuenta de prueba."
            : `Se eliminaron ${eliminadas} cuentas de prueba.`;
        const conservadas =
          conCitas === 1
            ? "Se conservó 1 cuenta con citas."
            : `Se conservaron ${conCitas} cuentas con citas.`;
        return { ok: true, datos: `${bajas} ${conservadas}` };
      },
    });
  }

  function enviarConfirmacion(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (confirmacion && !ocupado) {
      const datos = new FormData(evento.currentTarget);
      evento.currentTarget.reset();
      void ejecutar(confirmacion.ejecutar, datos);
    }
  }

  return (
    <>
      {aviso && <Aviso error={aviso.error}>{aviso.mensaje}</Aviso>}
      <div className="grid items-start gap-5 md:grid-cols-3">
        <div className="grid gap-5">
          <Superficie titulo="Invitar al equipo" id="invitar">
            <p className="text-texto-secundario">
              La persona recibirá un enlace para crear su contraseña.
            </p>
            <FormularioInvitacion
              alInvitar={invitar}
              ocupado={ocupado}
              puedeCrearAdmin={adminHabilitado}
              puedeCrearPruebas={limpiezaHabilitada}
            />
          </Superficie>
          {limpiezaHabilitada && (
            <Superficie titulo="Limpieza de pruebas" id="limpieza">
              <p className="text-texto-secundario">
                {cantidadPruebas === 1
                  ? "Hay 1 cuenta de prueba."
                  : `Hay ${cantidadPruebas} cuentas de prueba.`}{" "}
                Las cuentas con citas y los datos de ejemplo se conservan.
              </p>
              <Boton
                tono="peligro"
                type="button"
                disabled={ocupado || cantidadPruebas === 0}
                onClick={limpiar}
              >
                Limpiar cuentas de prueba
              </Boton>
            </Superficie>
          )}
        </div>
        <div className="grid gap-5 md:col-span-2">
          <Superficie titulo="Psicólogos" id="psicologos">
            <ListaCuentas cuentas={psicologos} {...acciones} />
          </Superficie>
          {adminHabilitado && (
            <Superficie titulo="Administradores" id="administradores">
              <ListaCuentas cuentas={administradores} {...acciones} />
            </Superficie>
          )}
        </div>
      </div>
      <dialog
        ref={dialogo}
        aria-labelledby={tituloDialogo}
        aria-describedby={detalleDialogo}
        onCancel={(evento) => {
          if (ocupado) evento.preventDefault();
        }}
        onClose={() => setConfirmacion(undefined)}
        className="m-auto max-w-md rounded-l bg-fondo-superficie p-5 text-texto-principal shadow-flotante [&:modal]:overscroll-contain backdrop:overflow-hidden backdrop:overscroll-contain backdrop:bg-texto-principal/50"
      >
        {confirmacion && (
          <form className="grid gap-4" onSubmit={enviarConfirmacion}>
            <h1
              id={tituloDialogo}
              className="text-h2 font-fuerte text-texto-titulo"
            >
              {confirmacion.titulo}
            </h1>
            <p id={detalleDialogo}>{confirmacion.detalle}</p>
            <Campo
              etiqueta="Tu contraseña actual"
              name="clave"
              type="password"
              maxLength={200}
              autoComplete="current-password"
              required
            />
            {errorDialogo && <Aviso error>{errorDialogo}</Aviso>}
            <div className="flex flex-wrap justify-end gap-3">
              <Boton
                type="button"
                tono="secundario"
                ref={cancelar}
                disabled={ocupado}
                onClick={() => dialogo.current?.close()}
              >
                Cancelar
              </Boton>
              <Boton
                tono={confirmacion.peligro ? "peligro" : "principal"}
                disabled={ocupado}
              >
                {ocupado ? "Procesando…" : "Confirmar"}
              </Boton>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
