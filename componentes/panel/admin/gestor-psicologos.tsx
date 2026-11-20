"use client";
import { SIN_CONEXION } from "@/contratos/resultado";

import { useState, useTransition, type FormEvent } from "react";
import {
  UserPlus,
  Send,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Power,
  X,
} from "lucide-react";
import type { Area, UsuarioResumen } from "@/contratos/psicologo";
import {
  crearPsicologoAccion,
  actualizarPsicologoAccion,
  reenviarInvitacionAccion,
} from "@/servidor/acciones";
import { CambioEstadoUsuario } from "./cambio-estado-usuario";
import { Boton } from "@/componentes/atomos/boton";

interface GestorPsicologosProps {
  psicologosIniciales: UsuarioResumen[];
}

export function GestorPsicologos({
  psicologosIniciales,
}: GestorPsicologosProps) {
  const [psicologos, setPsicologos] =
    useState<UsuarioResumen[]>(psicologosIniciales);
  const [modalCrear, setModalCrear] = useState(false);
  const [usuarioACambiar, setUsuarioACambiar] = useState<UsuarioResumen | null>(
    null,
  );
  const [psicologoAEditar, setPsicologoAEditar] =
    useState<UsuarioResumen | null>(null);

  // Campos formulario creación
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [nuevaArea, setNuevaArea] = useState<Area>("PSICOLOGIA");

  // Campos formulario edición
  const [editNombre, setEditNombre] = useState("");
  const [editArea, setEditArea] = useState<Area>("PSICOLOGIA");

  const [mensaje, setMensaje] = useState<{
    tipo: "exito" | "error";
    texto: string;
  } | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();

  // Abrir modal edición
  const abrirEdicion = (p: UsuarioResumen) => {
    setPsicologoAEditar(p);
    setEditNombre(p.nombre);
    setEditArea(p.area || "PSICOLOGIA");
  };

  // Crear psicólogo
  const manejarCrear = (e: FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    iniciarTransicion(async () => {
      try {
        const res = await crearPsicologoAccion({
          nombre: nuevoNombre.trim(),
          correo: nuevoCorreo.trim().toLowerCase(),
          area: nuevaArea,
        });

        if (res.ok) {
          setPsicologos((prev) => [res.datos, ...prev]);
          setModalCrear(false);
          setNuevoNombre("");
          setNuevoCorreo("");
          setMensaje({
            tipo: "exito",
            texto: `Psicólogo invitado con éxito. Se envió el correo de activación a ${nuevoCorreo}.`,
          });
        } else {
          setMensaje({
            tipo: "error",
            texto: res.mensaje || "Error al invitar psicólogo.",
          });
        }
      } catch {
        setMensaje({ tipo: "error", texto: SIN_CONEXION });
      }
    });
  };

  // Editar psicólogo
  const manejarActualizar = (e: FormEvent) => {
    e.preventDefault();
    if (!psicologoAEditar) return;
    setMensaje(null);

    iniciarTransicion(async () => {
      try {
        const res = await actualizarPsicologoAccion({
          id: psicologoAEditar.id,
          nombre: editNombre.trim(),
          area: editArea,
        });

        if (res.ok) {
          setPsicologos((prev) =>
            prev.map((p) =>
              p.id === psicologoAEditar.id
                ? { ...p, nombre: editNombre.trim(), area: editArea }
                : p,
            ),
          );
          setPsicologoAEditar(null);
          setMensaje({
            tipo: "exito",
            texto: "Datos actualizados correctamente.",
          });
        } else {
          setMensaje({
            tipo: "error",
            texto: res.mensaje || "Error al actualizar.",
          });
        }
      } catch {
        setMensaje({ tipo: "error", texto: SIN_CONEXION });
      }
    });
  };

  // Reenviar invitación
  const manejarReenviar = async (id: string, correo: string) => {
    setMensaje(null);
    try {
      const res = await reenviarInvitacionAccion(id);
      if (res.ok) {
        setMensaje({
          tipo: "exito",
          texto: `Invitación reenviada a ${correo}.`,
        });
      } else {
        setMensaje({
          tipo: "error",
          texto: res.mensaje || "Error al reenviar.",
        });
      }
    } catch {
      setMensaje({ tipo: "error", texto: SIN_CONEXION });
    }
  };

  return (
    <div className="space-y-6 w-full">
      {usuarioACambiar && (
        <CambioEstadoUsuario
          usuario={usuarioACambiar}
          alCerrar={() => setUsuarioACambiar(null)}
          alGuardar={(usuario) => {
            setPsicologos((prev) =>
              prev.map((p) => (p.id === usuario.id ? usuario : p)),
            );
            setMensaje({
              tipo: "exito",
              texto:
                usuario.estado === "ACTIVO"
                  ? "Psicólogo activado."
                  : "Psicólogo desactivado.",
            });
          }}
        />
      )}
      {/* Notificación */}
      {mensaje && (
        <div
          role="status"
          className={`p-4 rounded-m flex items-start gap-[10px] text-caption font-medio border ${
            mensaje.tipo === "exito"
              ? "bg-exito-fondo text-exito-texto border-agua-700/20"
              : "bg-error-fondo text-error-texto border-coral-700/20"
          }`}
        >
          {mensaje.tipo === "exito" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-[2px]" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-[2px]" />
          )}
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* Botón Superior */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setModalCrear(true)}
          className="inline-flex items-center gap-2 px-5 py-[10px] rounded-m bg-accion-fondo text-accion-texto text-caption font-fuerte hover:bg-accion-fondo-activo transition-all  cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invitar psicólogo</span>
        </button>
      </div>

      {/* Tabla de Psicólogos */}
      <div className="rounded-m bg-fondo-superficie border border-borde-suave  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-caption">
            <thead>
              <tr className="border-b border-borde-suave bg-fondo-suave/60 text-caption font-fuerte text-texto-secundario uppercase tracking-wider">
                <th className="py-3 px-4">Terapeuta</th>
                <th className="py-3 px-4">Correo Institucional</th>
                <th className="py-3 px-4">Área</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde-suave text-texto-principal">
              {psicologos.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-fondo-suave/50 transition-colors"
                >
                  <td className="py-[14px] px-4 font-fuerte text-texto-titulo">
                    {p.nombre}
                  </td>
                  <td className="py-[14px] px-4 font-mono text-caption text-texto-secundario">
                    {p.correo}
                  </td>
                  <td className="py-[14px] px-4">
                    <span className="px-2 py-[2px] rounded-pildora text-caption font-medio bg-morado-50 text-morado-700 border border-morado-100">
                      {p.area || "PSICOLOGIA"}
                    </span>
                  </td>
                  <td className="py-[14px] px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-[6px] px-[10px] py-[2px] rounded-pildora text-caption font-medio border ${
                        p.estado === "ACTIVO"
                          ? "bg-exito-fondo text-agua-700 border-agua-500/30"
                          : p.estado === "INVITADO"
                            ? "bg-aviso-fondo text-amarillo-700 border-amarillo-500/30"
                            : "bg-fondo-suave text-texto-secundario border-borde-suave"
                      }`}
                    >
                      <span
                        className={`w-[6px] h-[6px] rounded-circulo ${
                          p.estado === "ACTIVO"
                            ? "bg-agua-500"
                            : p.estado === "INVITADO"
                              ? "bg-amarillo-500"
                              : "bg-texto-secundario"
                        }`}
                      />
                      <span>{p.estado}</span>
                    </span>
                  </td>
                  <td className="py-[14px] px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {p.estado === "INVITADO" && (
                        <button
                          type="button"
                          onClick={() => manejarReenviar(p.id, p.correo)}
                          className="inline-flex items-center gap-1 px-[10px] py-1 text-caption font-medio text-texto-enlace hover:bg-fondo-suave rounded-s border border-borde-suave transition-colors"
                          title="Reenviar correo de activación"
                        >
                          <Send className="w-3 h-3" />
                          <span>Reenviar</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => abrirEdicion(p)}
                        className="p-[6px] text-texto-secundario hover:text-texto-principal hover:bg-fondo-suave rounded-s transition-colors"
                        title="Editar datos"
                      >
                        <Edit2 className="w-[14px] h-[14px]" />
                      </button>

                      {p.estado !== "INVITADO" && (
                        <Boton
                          tipo="borde"
                          onClick={() => {
                            setMensaje(null);
                            setUsuarioACambiar(p);
                          }}
                          className="px-3 focus-visible:outline-2 focus-visible:outline-foco"
                          aria-label={`${p.estado === "ACTIVO" ? "Desactivar" : "Activar"} a ${p.nombre}`}
                        >
                          <Power className="w-4 h-4" aria-hidden="true" />
                          {p.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                        </Boton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR / INVITAR PSICÓLOGO */}
      {modalCrear && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-morado-900/40 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-fondo-superficie rounded-m border border-borde-suave shadow-flotante p-6 relative">
            <button
              type="button"
              onClick={() => setModalCrear(false)}
              className="absolute top-4 right-4 text-texto-secundario hover:text-texto-principal p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-h2 font-fuerte text-texto-titulo mb-1">
              Invitar Terapeuta
            </h3>
            <p className="text-caption text-texto-secundario mb-4 text-caption">
              Se enviará una invitación a su correo institucional con enlace de
              24–48 h para crear su clave.
            </p>

            <form onSubmit={manejarCrear} className="space-y-4 text-caption">
              <div>
                <label className="block font-medio text-texto-principal mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Dr. Carlos Rodríguez"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full p-[10px] rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
                />
              </div>

              <div>
                <label className="block font-medio text-texto-principal mb-1">
                  Correo institucional
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@unilasallista.edu.co"
                  value={nuevoCorreo}
                  onChange={(e) => setNuevoCorreo(e.target.value)}
                  className="w-full p-[10px] rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
                />
              </div>

              <div>
                <label className="block font-medio text-texto-principal mb-1">
                  Área clínica
                </label>
                <select
                  value={nuevaArea}
                  onChange={(e) => setNuevaArea(e.target.value as Area)}
                  className="w-full p-[10px] rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
                >
                  <option value="PSICOLOGIA">Psicología</option>
                  <option value="NEUROPSICOLOGIA">Neuropsicología</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-borde-suave">
                <button
                  type="button"
                  onClick={() => setModalCrear(false)}
                  className="px-4 py-2 rounded-m border border-borde-control hover:bg-fondo-suave cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pendiente}
                  className="px-5 py-2 rounded-m bg-accion-fondo text-accion-texto font-fuerte hover:bg-accion-fondo-activo cursor-pointer disabled:opacity-50"
                >
                  {pendiente ? "Enviando..." : "Enviar invitación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PSICÓLOGO */}
      {psicologoAEditar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-morado-900/40 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-fondo-superficie rounded-m border border-borde-suave shadow-flotante p-6 relative">
            <button
              type="button"
              onClick={() => setPsicologoAEditar(null)}
              className="absolute top-4 right-4 text-texto-secundario hover:text-texto-principal p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-h2 font-fuerte text-texto-titulo mb-4">
              Editar Datos del Terapeuta
            </h3>

            <form
              onSubmit={manejarActualizar}
              className="space-y-4 text-caption"
            >
              <div>
                <label className="block font-medio text-texto-principal mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full p-[10px] rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
                />
              </div>

              <div>
                <label className="block font-medio text-texto-principal mb-1">
                  Área clínica
                </label>
                <select
                  value={editArea}
                  onChange={(e) => setEditArea(e.target.value as Area)}
                  className="w-full p-[10px] rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
                >
                  <option value="PSICOLOGIA">Psicología</option>
                  <option value="NEUROPSICOLOGIA">Neuropsicología</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-borde-suave">
                <button
                  type="button"
                  onClick={() => setPsicologoAEditar(null)}
                  className="px-4 py-2 rounded-m border border-borde-control hover:bg-fondo-suave cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pendiente}
                  className="px-5 py-2 rounded-m bg-accion-fondo text-accion-texto font-fuerte hover:bg-accion-fondo-activo cursor-pointer disabled:opacity-50"
                >
                  {pendiente ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
