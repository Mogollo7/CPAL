"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff, RefreshCw, ShieldCheck } from "lucide-react";
import { Titulo } from "@/componentes/atomos/titulo";
import { claseBoton } from "@/componentes/atomos/boton";
import { Campo } from "@/componentes/moleculas/campo";
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
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [codigo, setCodigo] = useState("");

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
    <div className="reticula-capl w-full max-w-[34rem] rounded-l bg-fondo-superficie p-4 shadow-flotante sm:p-6">
      <div className="col-span-4 min-w-0">
        <div className="mb-5">
          <Titulo nivel="h1" tamano="seccion">
            {paso2FA ? "Segundo paso de seguridad" : "Ingresar a la plataforma"}
          </Titulo>
          <p className="mt-2 max-w-[65ch] text-p text-texto-secundario">
            {paso2FA
              ? "Introduce el código de 6 dígitos enviado a tu correo institucional."
              : "Ingresa tus credenciales autorizadas del CAPL."}
          </p>
        </div>

        {/* Alerta de error */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-4 rounded-m bg-error-fondo border border-error-texto/20 flex items-start gap-2 text-error-texto text-caption font-medio"
          >
            <AlertCircle className="size-[16px] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Alerta de reenvío */}
        {mensajeReenvio && (
          <div
            role="status"
            className="mb-4 p-4 rounded-m bg-exito-fondo border border-exito-texto/20 flex items-start gap-2 text-exito-texto text-caption font-medio"
          >
            <ShieldCheck className="size-[16px] shrink-0 mt-0.5" />
            <span>{mensajeReenvio}</span>
          </div>
        )}

        {/* FORMULARIO PASO 1: Correo y Clave */}
        {!paso2FA ? (
          <form action={manejarIngreso} className="space-y-4">
            <Campo
              id="correo"
              name="correo"
              type="email"
              required
              etiqueta="Correo institucional"
              placeholder="ejemplo@unisalle.edu.co"
              autoComplete="email"
              valor={correo}
              alCambiar={setCorreo}
            />

            <div className="relative">
              <Campo
                id="clave"
                name="clave"
                type={mostrarClave ? "text" : "password"}
                required
                etiqueta="Contraseña"
                placeholder="••••••••••••"
                autoComplete="current-password"
                valor={clave}
                alCambiar={setClave}
              />
              <button
                type="button"
                onClick={() => setMostrarClave(!mostrarClave)}
                className="absolute right-1 top-[25px] flex size-[48px] items-center justify-center text-texto-secundario hover:text-texto-principal"
                aria-label={
                  mostrarClave ? "Ocultar contraseña" : "Ver contraseña"
                }
              >
                {mostrarClave ? (
                  <EyeOff className="size-[18px]" />
                ) : (
                  <Eye className="size-[18px]" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="inline-flex items-center gap-2 text-caption text-texto-secundario cursor-pointer">
                <input
                  id="recordar"
                  name="recordar"
                  type="checkbox"
                  className="size-[16px] rounded-s border border-borde text-accion-fondo focus-visible:outline-3 focus-visible:outline-foco"
                />
                <span>Recordarme</span>
              </label>
              <Link
                href="/recuperar-clave"
                className="text-caption font-medio text-texto-enlace hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={pendiente}
              className={claseBoton("principal", "w-full")}
            >
              <span>{pendiente ? "Verificando..." : "Ingresar"}</span>
            </button>

            <div className="mt-5 bg-fondo-suave rounded-m p-4 text-caption text-texto-secundario">
              <p className="font-medio text-texto-principal">
                ¿Aún no tienes cuenta?
              </p>
              <p className="mt-1">
                El acceso está reservado al equipo administrativo y terapéutico
                del CAPL. Si formas parte del equipo y necesitas una cuenta,
                comunícate con la coordinación.
              </p>
            </div>
          </form>
        ) : (
          /* FORMULARIO PASO 2: Código 2FA */
          <form action={manejarVerificarCodigo} className="space-y-4">
            <Campo
              id="codigo"
              name="codigo"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              autoFocus
              etiqueta="Código de verificación (6 dígitos)"
              placeholder="000000"
              valor={codigo}
              alCambiar={setCodigo}
            />

            {/* Casilla Recordar dispositivo */}
            <label className="flex items-start gap-2 text-caption text-texto-secundario cursor-pointer">
              <input
                id="recordar"
                name="recordar"
                type="checkbox"
                defaultChecked
                className="size-[16px] mt-0.5 rounded-s border border-borde text-accion-fondo focus-visible:outline-3 focus-visible:outline-foco"
              />
              <span>
                Recordar este dispositivo por 30 días en este navegador
              </span>
            </label>

            <button
              type="submit"
              disabled={pendiente}
              className={claseBoton("principal", "w-full")}
            >
              <span>
                {pendiente ? "Confirmando código..." : "Verificar y entrar"}
              </span>
            </button>

            {/* Acciones secundarias 2FA */}
            <div className="flex flex-col items-center gap-2 pt-3 border-t border-borde-suave text-center">
              <button
                type="button"
                onClick={manejarReenviar}
                disabled={pendiente}
                className="inline-flex items-center gap-1.5 text-caption font-medio text-texto-enlace hover:underline disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className="size-[14px]" />
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
    </div>
  );
}
