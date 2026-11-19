"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Mail,
} from "lucide-react";
import {
  crearClaveAccion,
  solicitarEnlaceAccion,
} from "@/servidor/cuentas/acciones";

interface FormularioCrearClaveProps {
  token: string;
}

export function FormularioCrearClave({ token }: FormularioCrearClaveProps) {
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enlaceVencido, setEnlaceVencido] = useState(false);
  const [reenvioExitoso, setReenvioExitoso] = useState(false);
  const [pendiente, iniciarTransicion] = useTransition();

  const manejarEnvio = (formData: FormData) => {
    setError(null);
    iniciarTransicion(async () => {
      const res = await crearClaveAccion(null, formData);
      if (!res.ok) {
        if (
          res.codigo === "ENLACE_INVALIDO" ||
          res.codigo === "ENLACE_VENCIDO"
        ) {
          setEnlaceVencido(true);
        }
        setError(res.mensaje || "Error al definir la contraseña.");
      }
    });
  };

  const manejarSolicitarNuevo = (formData: FormData) => {
    setError(null);
    iniciarTransicion(async () => {
      const res = await solicitarEnlaceAccion(null, formData);
      if (res.ok) {
        setReenvioExitoso(true);
      } else {
        setError(res.mensaje || "No se pudo procesar la solicitud.");
      }
    });
  };

  if (enlaceVencido) {
    return (
      <div className="w-full max-w-md bg-fondo-superficie rounded-l border border-borde-suave shadow-flotante p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-m bg-aviso-fondo text-aviso-texto flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-amarillo-700" />
          </div>
          <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
            Enlace vencido o no válido
          </h2>
          <p className="text-p text-texto-secundario mt-2 text-sm leading-relaxed">
            Por seguridad, los enlaces para crear o recuperar contraseña tienen
            una vigencia limitada (24–48 horas) y se invalidan tras ser usados.
          </p>
        </div>

        {reenvioExitoso ? (
          <div className="p-4 rounded-m bg-exito-fondo text-exito-texto border border-agua-700/20 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-agua-700" />
            <p className="font-weight-fuerte text-p">Solicitud enviada</p>
            <p className="text-caption mt-1">
              Si tu correo está registrado en el CAPL, recibirás un nuevo enlace
              de acceso de inmediato.
            </p>
            <Link
              href="/ingresar"
              className="mt-4 inline-block text-caption font-weight-fuerte text-texto-enlace hover:underline"
            >
              Volver a la pantalla de ingreso
            </Link>
          </div>
        ) : (
          <form action={manejarSolicitarNuevo} className="space-y-4">
            <div>
              <label
                htmlFor="correo-renovacion"
                className="block text-caption font-weight-medio text-texto-principal mb-1.5"
              >
                Ingresa tu correo institucional para recibir otro enlace
              </label>
              <div className="relative">
                <input
                  id="correo-renovacion"
                  name="correo"
                  type="email"
                  required
                  placeholder="ejemplo@unisalle.edu.co"
                  className="w-full pl-10 pr-4 py-2.5 rounded-m border border-borde-control bg-fondo-superficie text-texto-principal text-p focus-visible:outline-2 focus-visible:outline-morado-600"
                />
                <Mail
                  className="w-4 h-4 text-texto-secundario absolute left-3.5 top-3"
                  aria-hidden="true"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={pendiente}
              className="w-full py-3 px-4 rounded-m bg-accion-fondo text-accion-texto font-weight-fuerte text-p hover:bg-accion-fondo-activo transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {pendiente ? "Enviando..." : "Solicitar nuevo enlace"}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-fondo-superficie rounded-l border border-borde-suave shadow-flotante p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-m bg-accion-suave-fondo text-accion-fondo flex items-center justify-center mx-auto mb-3">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Crea tu contraseña
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          Te damos la bienvenida al equipo del CAPL. Define tu clave para
          activar tu cuenta.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-m bg-error-fondo/70 border border-error-texto/20 flex items-start gap-2.5 text-error-texto text-caption font-weight-medio"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form action={manejarEnvio} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <div>
          <label
            htmlFor="clave"
            className="block text-caption font-weight-medio text-texto-principal mb-1.5"
          >
            Nueva contraseña
          </label>
          <div className="relative">
            <input
              id="clave"
              name="clave"
              type={mostrarClave ? "text" : "password"}
              required
              minLength={10}
              placeholder="Mínimo 10 caracteres"
              autoComplete="new-password"
              className="w-full pl-10 pr-10 py-2.5 rounded-m border border-borde-control bg-fondo-superficie text-texto-principal text-p focus-visible:outline-2 focus-visible:outline-morado-600 transition-colors"
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
          <p className="text-[11px] text-texto-secundario mt-1">
            Usa al menos 10 caracteres seguros, distintos de tu correo.
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmacion"
            className="block text-caption font-weight-medio text-texto-principal mb-1.5"
          >
            Confirmar contraseña
          </label>
          <div className="relative">
            <input
              id="confirmacion"
              name="confirmacion"
              type={mostrarClave ? "text" : "password"}
              required
              minLength={10}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
              className="w-full pl-10 pr-4 py-2.5 rounded-m border border-borde-control bg-fondo-superficie text-texto-principal text-p focus-visible:outline-2 focus-visible:outline-morado-600 transition-colors"
            />
            <KeyRound
              className="w-4 h-4 text-texto-secundario absolute left-3.5 top-3"
              aria-hidden="true"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pendiente}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-m bg-accion-fondo text-accion-texto font-weight-fuerte text-p hover:bg-accion-fondo-activo transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <span>
            {pendiente
              ? "Guardando contraseña..."
              : "Guardar contraseña e ingresar"}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
