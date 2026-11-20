"use client";

import { useState, useTransition, type FormEvent } from "react";
import { X, AlertCircle } from "lucide-react";
import { cn } from "@/componentes/cn";

interface ModalAccionCitaProps {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  descripcion: string;
  textoBoton: string;
  variante?: "peligro" | "exito" | "primario";
  requiereMotivo?: boolean;
  placeholderMotivo?: string;
  alConfirmar: (motivo?: string) => Promise<{ ok: boolean; mensaje?: string }>;
}

export function ModalAccionCita({
  abierto,
  alCerrar,
  titulo,
  descripcion,
  textoBoton,
  variante = "primario",
  requiereMotivo = false,
  placeholderMotivo = "Describe detalladamente la razón (mínimo 3 caracteres)...",
  alConfirmar,
}: ModalAccionCitaProps) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();

  if (!abierto) return null;

  const manejarEnvio = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (requiereMotivo && motivo.trim().length < 3) {
      setError("Debes indicar un motivo de al menos 3 caracteres.");
      return;
    }

    iniciarTransicion(async () => {
      const res = await alConfirmar(requiereMotivo ? motivo.trim() : undefined);
      if (!res.ok) {
        setError(res.mensaje || "Ocurrió un error al procesar la acción.");
      } else {
        alCerrar();
      }
    });
  };

  const estiloBotonConfirmar =
    variante === "peligro"
      ? "bg-coral-700 text-blanco hover:bg-coral-700/90"
      : variante === "exito"
        ? "bg-agua-700 text-blanco hover:bg-agua-700/90"
        : "bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-morado-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg bg-fondo-superficie rounded-m border border-borde-suave shadow-flotante p-6 relative">
        <button
          type="button"
          onClick={alCerrar}
          disabled={pendiente}
          className="absolute top-4 right-4 text-texto-secundario hover:text-texto-principal p-1 rounded-s"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-h2 font-fuerte text-texto-titulo mb-2">{titulo}</h3>
        <p className="text-p text-texto-secundario text-caption mb-4 leading-relaxed">
          {descripcion}
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-m bg-error-fondo text-error-texto border border-coral-700/20 text-caption font-medio flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-[2px]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={manejarEnvio} className="space-y-4">
          {requiereMotivo && (
            <div>
              <label
                htmlFor="modal-motivo"
                className="block text-caption font-medio text-texto-principal mb-[6px]"
              >
                Motivo <span className="text-coral-700">*</span>
              </label>
              <textarea
                id="modal-motivo"
                required
                minLength={3}
                maxLength={300}
                rows={3}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder={placeholderMotivo}
                className="w-full p-3 rounded-m border border-borde-control bg-fondo-superficie text-texto-principal placeholder:text-texto-secundario/50 text-caption focus-visible:outline-2 focus-visible:outline-morado-600 resize-none"
              />
              <span className="block text-[11px] text-texto-secundario text-right mt-1">
                {motivo.length}/300 caracteres
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-borde-suave">
            <button
              type="button"
              onClick={alCerrar}
              disabled={pendiente}
              className="px-4 py-2 rounded-m border border-borde-control text-caption font-medio text-texto-principal hover:bg-fondo-suave cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={pendiente}
              className={cn(
                "px-5 py-2 rounded-m text-caption font-fuerte  cursor-pointer disabled:opacity-50 transition-all",
                estiloBotonConfirmar,
              )}
            >
              {pendiente ? "Procesando..." : textoBoton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
