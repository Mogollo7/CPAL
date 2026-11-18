"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Send } from "lucide-react";
import { solicitarEnlaceAccion } from "@/servidor/cuentas/acciones";

export default function PaginaRecuperarClave() {
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();

  const manejarEnvio = (formData: FormData) => {
    setError(null);
    iniciarTransicion(async () => {
      const res = await solicitarEnlaceAccion(null, formData);
      if (res.ok) {
        setEnviado(true);
      } else {
        setError(res.mensaje || "Ocurrió un error al procesar tu solicitud.");
      }
    });
  };

  return (
    <div className="w-full max-w-md bg-fondo-superficie rounded-l border border-borde-suave shadow-flotante p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-m bg-accion-suave-fondo text-accion-fondo flex items-center justify-center mx-auto mb-3">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Recuperar contraseña
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          Te enviaremos un enlace de acceso seguro a tu correo institucional.
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

      {enviado ? (
        <div className="text-center space-y-4">
          <div className="p-4 rounded-m bg-exito-fondo text-exito-texto border border-agua-700/20">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-agua-700" />
            <h3 className="font-weight-fuerte text-h2 mb-1">Revisa tu correo</h3>
            <p className="text-p text-sm leading-relaxed">
              Si tu cuenta existe en el sistema del CAPL, recibirás un enlace válido durante 24–48 horas para restablecer tu contraseña.
            </p>
          </div>

          <Link
            href="/ingresar"
            className="inline-flex items-center gap-2 text-caption font-weight-fuerte text-texto-enlace hover:underline pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la pantalla de ingreso</span>
          </Link>
        </div>
      ) : (
        <form action={manejarEnvio} className="space-y-4">
          <div>
            <label
              htmlFor="correo"
              className="block text-caption font-weight-medio text-texto-principal mb-1.5"
            >
              Correo institucional registrado
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

          <button
            type="submit"
            disabled={pendiente}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-m bg-accion-fondo text-accion-texto font-weight-fuerte text-p hover:bg-accion-fondo-activo transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{pendiente ? "Enviando enlace..." : "Enviar enlace de recuperación"}</span>
          </button>

          <div className="pt-3 text-center">
            <Link
              href="/ingresar"
              className="inline-flex items-center gap-1.5 text-caption font-weight-medio text-texto-secundario hover:text-texto-principal transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a ingresar</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
