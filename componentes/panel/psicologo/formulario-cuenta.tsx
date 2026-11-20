"use client";
import { claseBoton } from "@/componentes/atomos/boton";
import { CLASE_CONTROL } from "@/componentes/moleculas/campo";
import { SIN_CONEXION } from "@/contratos/resultado";

import { useState, useTransition, type FormEvent } from "react";
import {
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import {
  cambiarClaveAccion,
  cerrarMisSesionesAccion,
} from "@/servidor/cuentas/acciones";

export function FormularioCuenta() {
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);

  const [claveActual, setClaveActual] = useState("");
  const [claveNueva, setClaveNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");

  const [mensaje, setMensaje] = useState<{
    tipo: "exito" | "error";
    texto: string;
  } | null>(null);
  const [guardando, iniciarTransicionClave] = useTransition();
  const [cerrandoSesiones, iniciarTransicionSesiones] = useTransition();

  const manejarCambioClave = (e: FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    if (claveNueva.length < 10) {
      setMensaje({
        tipo: "error",
        texto: "La nueva contraseña debe tener como mínimo 10 caracteres.",
      });
      return;
    }

    if (claveNueva !== confirmacion) {
      setMensaje({
        tipo: "error",
        texto: "La confirmación de la contraseña no coincide.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("claveActual", claveActual);
    formData.append("claveNueva", claveNueva);

    iniciarTransicionClave(async () => {
      try {
        const res = await cambiarClaveAccion(null, formData);
        if (res.ok) {
          setMensaje({
            tipo: "exito",
            texto: "Tu contraseña ha sido actualizada correctamente.",
          });
          setClaveActual("");
          setClaveNueva("");
          setConfirmacion("");
        } else {
          setMensaje({
            tipo: "error",
            texto: res.mensaje || "Error al actualizar la contraseña.",
          });
        }
      } catch {
        setMensaje({ tipo: "error", texto: SIN_CONEXION });
      }
    });
  };

  const manejarCerrarTodasSesiones = () => {
    if (
      !confirm(
        "¿Estás seguro de que deseas cerrar todas tus sesiones activas en todos los dispositivos?",
      )
    ) {
      return;
    }

    iniciarTransicionSesiones(async () => {
      await cerrarMisSesionesAccion();
    });
  };

  return (
    <div className="space-y-5">
      {/* Alerta de notificación */}
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
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-1" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-1" />
          )}
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* SECCIÓN 1: CAMBIAR CONTRASEÑA */}
      <div className="p-4 sm:p-5 rounded-m bg-fondo-superficie border border-borde-suave space-y-6">
        <div className="flex items-center gap-[10px] pb-4 border-b border-borde-suave">
          <KeyRound className="w-5 h-5 text-morado-600" />
          <div>
            <h3 className="text-h2 font-fuerte text-texto-titulo">
              Cambiar Contraseña
            </h3>
            <p className="text-caption text-texto-secundario mt-1">
              Actualiza tu clave de acceso institucional.
            </p>
          </div>
        </div>

        <form onSubmit={manejarCambioClave} className="space-y-4">
          <div>
            <label
              htmlFor="clave-actual"
              className="block text-caption font-medio text-texto-principal mb-[6px]"
            >
              Contraseña actual
            </label>
            <div className="relative">
              <input
                id="clave-actual"
                type={mostrarActual ? "text" : "password"}
                required
                value={claveActual}
                onChange={(e) => setClaveActual(e.target.value)}
                placeholder="Ingresa tu clave actual"
                className={CLASE_CONTROL}
              />
              <button
                type="button"
                onClick={() => setMostrarActual(!mostrarActual)}
                className="absolute right-3 top-[10px] text-texto-secundario hover:text-texto-principal"
              >
                {mostrarActual ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="clave-nueva"
              className="block text-caption font-medio text-texto-principal mb-[6px]"
            >
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                id="clave-nueva"
                type={mostrarNueva ? "text" : "password"}
                required
                minLength={10}
                value={claveNueva}
                onChange={(e) => setClaveNueva(e.target.value)}
                placeholder="Mínimo 10 caracteres"
                className={CLASE_CONTROL}
              />
              <button
                type="button"
                onClick={() => setMostrarNueva(!mostrarNueva)}
                className="absolute right-3 top-[10px] text-texto-secundario hover:text-texto-principal"
              >
                {mostrarNueva ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-texto-secundario mt-1">
              Debe tener mínimo 10 caracteres y no coincidir con tu correo.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmacion"
              className="block text-caption font-medio text-texto-principal mb-[6px]"
            >
              Confirmar nueva contraseña
            </label>
            <input
              id="confirmacion"
              type={mostrarNueva ? "text" : "password"}
              required
              minLength={10}
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              placeholder="Repite la nueva contraseña"
              className={CLASE_CONTROL}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={guardando}
              className={claseBoton("principal", "shadow-none")}
            >
              <span>
                {guardando ? "Actualizando..." : "Actualizar contraseña"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* SECCIÓN 2: SEGURIDAD Y CIERRE DE SESIONES */}
      <div className="p-4 sm:p-5 rounded-m bg-fondo-superficie border border-borde-suave space-y-4">
        <div className="flex items-center gap-[10px] pb-3 border-b border-borde-suave">
          <ShieldAlert className="w-5 h-5 text-coral-700" />
          <div>
            <h3 className="text-h2 font-fuerte text-texto-titulo">
              Sesiones Activas
            </h3>
            <p className="text-caption text-texto-secundario mt-1">
              Control de acceso en dispositivos institucionales y personales.
            </p>
          </div>
        </div>

        <p className="text-caption text-texto-secundario text-caption leading-relaxed">
          Si utilizaste un computador público o sospechas que tu cuenta quedó
          abierta en otro navegador, puedes invalidar de inmediato todas las
          sesiones activas en cualquier equipo.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={manejarCerrarTodasSesiones}
            disabled={cerrandoSesiones}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-m bg-error-fondo text-coral-700 border border-coral-700/20 text-caption font-fuerte hover:bg-coral-700 hover:text-blanco transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>
              {cerrandoSesiones ? "Cerrando..." : "Cerrar todas mis sesiones"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
