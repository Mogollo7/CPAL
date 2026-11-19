"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  ingresarAccion,
  verificarCodigoAccion,
  reenviarCodigoAccion,
} from "@/servidor/cuentas/acciones";

export default function PaginaIngresar() {
  const [paso2FA, setPaso2FA] = useState(false);
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeReenvio, setMensajeReenvio] = useState<string | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();

  // Paso 1: Enviar correo y contraseña
  const manejarIngreso = (formData: FormData) => {
    setError(null);
    setMensajeReenvio(null);
    iniciarTransicion(async () => {
      const res = await ingresarAccion(null, formData);
      if (!res.ok) {
        if (res.codigo === "CODIGO_REQUERIDO") {
          setPaso2FA(true);
        } else {
          setError(res.mensaje || "Credenciales incorrectas.");
        }
      }
    });
  };

  // Paso 2: Verificar código 2FA
  const manejarVerificarCodigo = (formData: FormData) => {
    setError(null);
    iniciarTransicion(async () => {
      const res = await verificarCodigoAccion(null, formData);
      if (!res.ok) {
        setError(
          res.mensaje || "El código ingresado no es válido o ya venció.",
        );
      }
    });
  };

  // Reenviar código 2FA
  const manejarReenviar = () => {
    setError(null);
    setMensajeReenvio(null);
    iniciarTransicion(async () => {
      const res = await reenviarCodigoAccion();
      if (res.ok) {
        setMensajeReenvio(
          "Se ha enviado un nuevo código a tu correo institucional.",
        );
      } else {
        setError(
          res.mensaje || "No se pudo reenviar el código. Inténtalo de nuevo.",
        );
      }
    });
  };

  return (
    <div className="w-full max-w-md bg-fondo-superficie rounded-l border border-borde-suave shadow-flotante p-6 sm:p-8">
      {/* Encabezado de la tarjeta */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-m bg-accion-suave-fondo text-accion-fondo flex items-center justify-center mx-auto mb-3">
          {paso2FA ? (
            <ShieldCheck className="w-6 h-6" />
          ) : (
            <Lock className="w-6 h-6" />
          )}
        </div>
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          {paso2FA ? "Segundo paso de seguridad" : "Ingresar a la plataforma"}
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          {paso2FA
            ? "Introduce el código de 6 dígitos enviado a tu correo institucional."
            : "Ingresa tus credenciales autorizadas del CAPL."}
        </p>
      </div>

      {/* Alerta de error */}
      {error && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-m bg-error-fondo/70 border border-error-texto/20 flex items-start gap-2.5 text-error-texto text-caption font-weight-medio"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Alerta de reenvío */}
      {mensajeReenvio && (
        <div
          role="status"
          className="mb-5 p-3.5 rounded-m bg-exito-fondo/70 border border-exito-texto/20 flex items-start gap-2.5 text-exito-texto text-caption font-weight-medio"
        >
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{mensajeReenvio}</span>
        </div>
      )}

      {/* FORMULARIO PASO 1: Correo y Clave */}
      {!paso2FA ? (
        <form action={manejarIngreso} className="space-y-4">
          <div>
            <label
              htmlFor="correo"
              className="block text-caption font-weight-medio text-texto-principal mb-1.5"
            >
              Correo institucional
            </label>
            <div className="relative">
              <input
                id="correo"
                name="correo"
                type="email"
                required
                placeholder="ejemplo@unisalle.edu.co"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-m border border-borde-control bg-fondo-superficie text-texto-principal placeholder:text-texto-secundario/50 text-p focus-visible:outline-2 focus-visible:outline-morado-600 transition-colors"
              />
              <Mail
                className="w-4 h-4 text-texto-secundario absolute left-3.5 top-3"
                aria-hidden="true"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="clave"
                className="block text-caption font-weight-medio text-texto-principal"
              >
                Contraseña
              </label>
              <Link
                href="/recuperar-clave"
                className="text-caption text-texto-enlace font-weight-medio hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <input
                id="clave"
                name="clave"
                type={mostrarClave ? "text" : "password"}
                required
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 rounded-m border border-borde-control bg-fondo-superficie text-texto-principal placeholder:text-texto-secundario/50 text-p focus-visible:outline-2 focus-visible:outline-morado-600 transition-colors"
              />
              <KeyRound
                className="w-4 h-4 text-texto-secundario absolute left-3.5 top-3"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setMostrarClave(!mostrarClave)}
                className="absolute right-3 top-2.5 text-texto-secundario hover:text-texto-principal p-0.5 rounded-s"
                aria-label={
                  mostrarClave ? "Ocultar contraseña" : "Ver contraseña"
                }
              >
                {mostrarClave ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={pendiente}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-m bg-accion-fondo text-accion-texto font-weight-fuerte text-p hover:bg-accion-fondo-activo transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <span>{pendiente ? "Verificando..." : "Ingresar"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        /* FORMULARIO PASO 2: Código 2FA */
        <form action={manejarVerificarCodigo} className="space-y-5">
          <div>
            <label
              htmlFor="codigo"
              className="block text-caption font-weight-medio text-texto-principal mb-2 text-center"
            >
              Código de verificación (6 dígitos)
            </label>
            <input
              id="codigo"
              name="codigo"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              autoFocus
              placeholder="000000"
              className="w-full text-center text-h1 tracking-[0.5em] font-weight-fuerte py-3 px-4 rounded-m border border-borde-control bg-fondo-suave text-texto-titulo placeholder:text-texto-secundario/30 focus-visible:outline-2 focus-visible:outline-morado-600 transition-colors"
            />
          </div>

          {/* Casilla Recordar dispositivo */}
          <div className="flex items-start gap-2.5">
            <input
              id="recordar"
              name="recordar"
              type="checkbox"
              defaultChecked
              className="w-4 h-4 mt-0.5 rounded-s border-borde-control text-morado-600 focus:ring-morado-500"
            />
            <label
              htmlFor="recordar"
              className="text-caption text-texto-secundario cursor-pointer leading-tight"
            >
              Recordar este dispositivo por 30 días en este navegador
            </label>
          </div>

          <button
            type="submit"
            disabled={pendiente}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-m bg-accion-fondo text-accion-texto font-weight-fuerte text-p hover:bg-accion-fondo-activo transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <span>
              {pendiente ? "Confirmando código..." : "Verificar y entrar"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Acciones secundarias 2FA */}
          <div className="pt-3 border-t border-borde-suave flex flex-col gap-2 text-center">
            <button
              type="button"
              onClick={manejarReenviar}
              disabled={pendiente}
              className="inline-flex items-center justify-center gap-1.5 text-caption font-weight-medio text-texto-enlace hover:underline disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>¿No recibiste el código? Reenviar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPaso2FA(false);
                setError(null);
                setMensajeReenvio(null);
              }}
              className="text-caption text-texto-secundario hover:text-texto-principal"
            >
              Volver a ingresar con otro correo
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
