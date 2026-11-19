"use client";
import { SIN_CONEXION } from "@/contratos/resultado";

import { useState, useTransition, type FormEvent } from "react";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Mail,
  Sliders,
} from "lucide-react";
import type { Configuracion } from "@/contratos/configuracion";
import { actualizarConfiguracionAccion } from "@/servidor/acciones";

interface FormularioConfiguracionProps {
  configuracionInicial: Configuracion;
}

export function FormularioConfiguracion({
  configuracionInicial,
}: FormularioConfiguracionProps) {
  const [config, setConfig] = useState<Configuracion>(configuracionInicial);
  const [dominiosTexto, setDominiosTexto] = useState(
    configuracionInicial.dominiosPermitidos.join(", "),
  );
  const [mensaje, setMensaje] = useState<{
    tipo: "exito" | "error";
    texto: string;
  } | null>(null);
  const [guardando, iniciarTransicion] = useTransition();

  const manejarCambio = (
    campo: keyof Configuracion,
    valor: boolean | number | string,
  ) => {
    setMensaje(null);
    setConfig((prev) => ({ ...prev, [campo]: valor }));
  };

  const manejarEnvio = (e: FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    const dominiosArray = dominiosTexto
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .filter((d) => d.length > 0);

    const payload = {
      ...config,
      dominiosPermitidos: dominiosArray,
    };

    iniciarTransicion(async () => {
      try {
        const res = await actualizarConfiguracionAccion(payload);
        if (res.ok) {
          setConfig(res.datos);
          setMensaje({
            tipo: "exito",
            texto:
              "Configuración y reglas operativas actualizadas correctamente.",
          });
        } else {
          setMensaje({
            tipo: "error",
            texto: res.mensaje || "Error al actualizar la configuración.",
          });
        }
      } catch {
        setMensaje({ tipo: "error", texto: SIN_CONEXION });
      }
    });
  };

  return (
    <form onSubmit={manejarEnvio} className="space-y-8 max-w-4xl">
      {/* Alerta de notificación */}
      {mensaje && (
        <div
          role="status"
          className={`p-4 rounded-m flex items-start gap-2.5 text-caption font-weight-medio border ${
            mensaje.tipo === "exito"
              ? "bg-exito-fondo text-exito-texto border-agua-700/20"
              : "bg-error-fondo text-error-texto border-coral-700/20"
          }`}
        >
          {mensaje.tipo === "exito" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* SECCIÓN 1: REGLAS DE CITAS Y AUTORIZACIÓN (RF-ADM-06) */}
      <div className="p-6 rounded-l bg-fondo-superficie border border-borde-suave shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-borde-suave">
          <Sliders className="w-5 h-5 text-morado-600" />
          <div>
            <h3 className="text-h2 font-weight-fuerte text-texto-titulo">
              Políticas de Autorización y Citas
            </h3>
            <p className="text-caption text-texto-secundario mt-0.5">
              Controla el flujo de solicitudes y los plazos de atención clínica.
            </p>
          </div>
        </div>

        {/* Interruptor Auto-Autorizar (RF-ADM-06) */}
        <div className="p-4 rounded-m bg-fondo-suave border border-morado-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-weight-fuerte text-p text-texto-titulo">
                Autorizar automáticamente todas las citas
              </span>
              <span
                className={`px-2 py-0.5 rounded-pildora text-xs font-weight-medio ${
                  config.autoAutorizar
                    ? "bg-exito-fondo text-agua-700 border border-agua-500/30"
                    : "bg-aviso-fondo text-amarillo-700 border border-amarillo-500/30"
                }`}
              >
                {config.autoAutorizar
                  ? "Auto-aprobación activa"
                  : "Requiere visto bueno manual"}
              </span>
            </div>
            <p className="text-caption text-texto-secundario mt-1 max-w-xl text-xs leading-relaxed">
              Si está activo, las citas solicitadas pasan de inmediato a estado
              AUTORIZADA y se encola la confirmación al paciente sin que el
              administrador deba aprobarlas una por una.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              manejarCambio("autoAutorizar", !config.autoAutorizar)
            }
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-pildora border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-morado-600 ${
              config.autoAutorizar ? "bg-accion-fondo" : "bg-borde-suave"
            }`}
            role="switch"
            aria-checked={config.autoAutorizar}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-circulo bg-blanco shadow-lg ring-0 transition duration-200 ease-in-out ${
                config.autoAutorizar ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Plazos de Antelación y Vencimiento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-caption font-weight-medio text-texto-principal mb-1">
              Anticipación mínima para pedir cita (horas)
            </label>
            <input
              type="number"
              min={0}
              max={168}
              required
              value={config.anticipacionMinHoras}
              onChange={(e) =>
                manejarCambio("anticipacionMinHoras", Number(e.target.value))
              }
              className="w-full p-2.5 rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
            />
            <span className="block text-[11px] text-texto-secundario mt-1">
              Tiempo mínimo que debe haber entre el momento del agendamiento y
              el turno (ej. 24 h).
            </span>
          </div>

          <div>
            <label className="block text-caption font-weight-medio text-texto-principal mb-1">
              Anticipación máxima para agendar (días)
            </label>
            <input
              type="number"
              min={1}
              max={180}
              required
              value={config.anticipacionMaxDias}
              onChange={(e) =>
                manejarCambio("anticipacionMaxDias", Number(e.target.value))
              }
              className="w-full p-2.5 rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
            />
            <span className="block text-[11px] text-texto-secundario mt-1">
              Horizonte de días a futuro visibles en el calendario (ej. 30
              días).
            </span>
          </div>

          <div>
            <label className="block text-caption font-weight-medio text-texto-principal mb-1">
              Antelación mínima para cancelar (horas)
            </label>
            <input
              type="number"
              min={0}
              max={168}
              required
              value={config.cancelacionMinHoras}
              onChange={(e) =>
                manejarCambio("cancelacionMinHoras", Number(e.target.value))
              }
              className="w-full p-2.5 rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
            />
            <span className="block text-[11px] text-texto-secundario mt-1">
              Plazo límite antes de la cita para que el paciente pueda cancelar
              en línea (ej. 12 h).
            </span>
          </div>

          <div>
            <label className="block text-caption font-weight-medio text-texto-principal mb-1">
              Vencimiento de solicitud pendiente (horas)
            </label>
            <input
              type="number"
              min={1}
              max={336}
              required
              value={config.vencimientoPendienteHoras}
              onChange={(e) =>
                manejarCambio(
                  "vencimientoPendienteHoras",
                  Number(e.target.value),
                )
              }
              className="w-full p-2.5 rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
            />
            <span className="block text-[11px] text-texto-secundario mt-1">
              Tiempo para que administración autorice antes de que el cupo se
              libere (ej. 48 h).
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: LÍMITES Y CAPACIDAD */}
      <div className="p-6 rounded-l bg-fondo-superficie border border-borde-suave shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-borde-suave">
          <Calendar className="w-5 h-5 text-morado-600" />
          <div>
            <h3 className="text-h2 font-weight-fuerte text-texto-titulo">
              Límites de Uso y Reprogramaciones
            </h3>
            <p className="text-caption text-texto-secundario mt-0.5">
              Protección contra acaparamientos y reglas de equidad comunitaria.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-caption font-weight-medio text-texto-principal mb-1">
              Citas activas por persona
            </label>
            <input
              type="number"
              min={1}
              max={10}
              required
              value={config.maxCitasActivas}
              onChange={(e) =>
                manejarCambio("maxCitasActivas", Number(e.target.value))
              }
              className="w-full p-2.5 rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
            />
            <span className="block text-[11px] text-texto-secundario mt-1">
              Máximo de citas simultáneas pendientes/autorizadas por paciente
              (ej. 1).
            </span>
          </div>

          <div>
            <label className="block text-caption font-weight-medio text-texto-principal mb-1">
              Máximo de reprogramaciones
            </label>
            <input
              type="number"
              min={0}
              max={10}
              required
              value={config.maxReprogramaciones}
              onChange={(e) =>
                manejarCambio("maxReprogramaciones", Number(e.target.value))
              }
              className="w-full p-2.5 rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
            />
            <span className="block text-[11px] text-texto-secundario mt-1">
              Veces que un paciente puede mover la fecha de su cita (ej. 2).
            </span>
          </div>

          <div>
            <label className="block text-caption font-weight-medio text-texto-principal mb-1">
              Vigencia de enlaces (horas)
            </label>
            <input
              type="number"
              min={24}
              max={48}
              required
              value={config.duracionEnlaceHoras}
              onChange={(e) =>
                manejarCambio("duracionEnlaceHoras", Number(e.target.value))
              }
              className="w-full p-2.5 rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
            />
            <span className="block text-[11px] text-texto-secundario mt-1">
              Validez de enlaces de invitación y recuperación (24 a 48 h).
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: CORREOS Y DOMINIOS INSTITUCIONALES */}
      <div className="p-6 rounded-l bg-fondo-superficie border border-borde-suave shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-borde-suave">
          <Mail className="w-5 h-5 text-morado-600" />
          <div>
            <h3 className="text-h2 font-weight-fuerte text-texto-titulo">
              Canales y Dominios Institucionales
            </h3>
            <p className="text-caption text-texto-secundario mt-0.5">
              Restricciones de seguridad para creación de cuentas y buzón
              central.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-caption font-weight-medio text-texto-principal mb-1">
              Buzón de notificaciones de administración
            </label>
            <input
              type="email"
              required
              value={config.correoAdministracion}
              onChange={(e) =>
                manejarCambio("correoAdministracion", e.target.value)
              }
              className="w-full p-2.5 rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
            />
            <span className="block text-[11px] text-texto-secundario mt-1">
              Correo que recibe avisos de nuevas solicitudes de citas y reportes
              de atención.
            </span>
          </div>

          <div>
            <label className="block text-caption font-weight-medio text-texto-principal mb-1">
              Dominios de correo autorizados para psicólogos
            </label>
            <input
              type="text"
              required
              value={dominiosTexto}
              onChange={(e) => setDominiosTexto(e.target.value)}
              placeholder="unilasallista.edu.co, unisalle.edu.co"
              className="w-full p-2.5 rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600 font-mono text-xs"
            />
            <span className="block text-[11px] text-texto-secundario mt-1">
              Separados por coma. Solo se permite invitar psicólogos con estos
              dominios oficiales.
            </span>
          </div>
        </div>
      </div>

      {/* Botón de Guardado */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={guardando}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-m bg-accion-fondo text-accion-texto font-weight-fuerte text-caption hover:bg-accion-fondo-activo transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>
            {guardando ? "Guardando políticas..." : "Guardar configuración"}
          </span>
        </button>
      </div>
    </form>
  );
}
