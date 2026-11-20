"use client";
import { SIN_CONEXION } from "@/contratos/resultado";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Ban,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  FileText,
  History,
  Send,
  Check,
  AlertTriangle,
} from "lucide-react";
import type { CitaDetalle } from "@/contratos/cita";
import { PildoraEstado } from "./pildora-estado";
import { ModalAccionCita } from "./modal-accion-cita";
import { ReasignarCita } from "./reasignar-cita";
import {
  autorizarCitaAccion,
  rechazarCitaAccion,
  cancelarCitaAdminAccion,
  marcarAsistenciaAccion,
} from "@/servidor/acciones";

interface DetalleCitaClienteProps {
  cita: CitaDetalle & { servicioId: string };
}

function formatearFechaLarga(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "America/Bogota",
    }).format(d);
  } catch {
    return isoString;
  }
}

function formatearHora(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("es-CO", {
      timeStyle: "short",
      timeZone: "America/Bogota",
    }).format(d);
  } catch {
    return isoString;
  }
}

export function DetalleCitaCliente({
  cita: citaInicial,
}: DetalleCitaClienteProps) {
  const router = useRouter();
  const [cita, setCita] = useState(citaInicial);
  const [modalAutorizar, setModalAutorizar] = useState(false);
  const [modalRechazar, setModalRechazar] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Manejador Autorizar
  const ejecutarAutorizar = async () => {
    try {
      const res = await autorizarCitaAccion(cita.id);
      if (res.ok) {
        setCita((prev) => ({ ...prev, estado: "AUTORIZADA" }));
        setMensajeExito(
          "Cita autorizada con éxito. Se ha encolado el correo de confirmación al paciente.",
        );
        router.refresh();
        return { ok: true };
      }
      return { ok: false, mensaje: res.mensaje };
    } catch {
      return { ok: false, mensaje: SIN_CONEXION };
    }
  };

  // Manejador Rechazar
  const ejecutarRechazar = async (motivo?: string) => {
    try {
      const res = await rechazarCitaAccion({ id: cita.id, motivo: motivo! });
      if (res.ok) {
        setCita((prev) => ({
          ...prev,
          estado: "RECHAZADA",
          motivoRechazo: motivo || null,
        }));
        setMensajeExito("Cita rechazada. Se ha notificado al solicitante.");
        router.refresh();
        return { ok: true };
      }
      return { ok: false, mensaje: res.mensaje };
    } catch {
      return { ok: false, mensaje: SIN_CONEXION };
    }
  };

  // Manejador Cancelar
  const ejecutarCancelar = async (motivo?: string) => {
    try {
      const res = await cancelarCitaAdminAccion({
        id: cita.id,
        motivo: motivo!,
      });
      if (res.ok) {
        setCita((prev) => ({ ...prev, estado: "CANCELADA" }));
        setMensajeExito("Cita cancelada correctamente.");
        router.refresh();
        return { ok: true };
      }
      return { ok: false, mensaje: res.mensaje };
    } catch {
      return { ok: false, mensaje: SIN_CONEXION };
    }
  };

  // Manejador Marcar Asistencia
  const ejecutarAsistencia = async (resultado: "ATENDIDA" | "NO_ASISTIO") => {
    try {
      const res = await marcarAsistenciaAccion({ id: cita.id, resultado });
      if (res.ok) {
        setCita((prev) => ({ ...prev, estado: resultado }));
        setMensajeExito(
          resultado === "ATENDIDA"
            ? "Cita marcada como ATENDIDA."
            : "Cita marcada como NO ASISTIÓ.",
        );
        router.refresh();
      } else {
        setMensajeError(res.mensaje);
      }
    } catch {
      setMensajeError(SIN_CONEXION);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Botón Volver y Cabecera de Detalle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borde-suave">
        <div className="flex items-center gap-3">
          <Link
            href="/panel/admin/citas"
            className="p-2 rounded-m bg-fondo-superficie border border-borde-suave text-texto-secundario hover:text-texto-principal hover:bg-fondo-suave transition-colors"
            title="Volver a la bandeja de citas"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-h1 font-mono font-fuerte text-morado-900 tracking-tight">
                {cita.codigo}
              </h2>
              <PildoraEstado estado={cita.estado} />
            </div>
            <p className="text-caption text-texto-secundario mt-[2px]">
              Solicitud creada el {formatearFechaLarga(cita.creadaEn)}
            </p>
          </div>
        </div>

        {/* Barra de Acciones según el Estado */}
        <div className="flex items-center gap-2 flex-wrap">
          {cita.estado === "PENDIENTE" && (
            <>
              <button
                type="button"
                onClick={() => setModalAutorizar(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-m bg-agua-700 text-blanco text-caption font-fuerte hover:bg-agua-700/90 transition-all  cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Autorizar cita</span>
              </button>

              <button
                type="button"
                onClick={() => setModalRechazar(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-m bg-error-fondo text-coral-700 border border-coral-700/30 text-caption font-fuerte hover:bg-coral-700 hover:text-blanco transition-all  cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Rechazar</span>
              </button>
            </>
          )}

          {cita.estado === "AUTORIZADA" && (
            <>
              <button
                type="button"
                onClick={() => ejecutarAsistencia("ATENDIDA")}
                className="inline-flex items-center gap-2 px-[14px] py-2 rounded-m bg-morado-100 text-morado-700 text-caption font-fuerte hover:bg-morado-600 hover:text-blanco transition-all  cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Marcar atendida</span>
              </button>

              <button
                type="button"
                onClick={() => ejecutarAsistencia("NO_ASISTIO")}
                className="inline-flex items-center gap-2 px-[14px] py-2 rounded-m bg-fondo-suave text-texto-secundario border border-borde-suave text-caption font-medio hover:text-texto-principal hover:bg-fondo-superficie transition-all cursor-pointer"
              >
                <span>No asistió</span>
              </button>

              <button
                type="button"
                onClick={() => setModalCancelar(true)}
                className="inline-flex items-center gap-2 px-[14px] py-2 rounded-m bg-error-fondo/50 text-coral-700 border border-coral-700/20 text-caption font-medio hover:bg-error-fondo transition-all cursor-pointer"
              >
                <Ban className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alerta de Éxito */}
      {mensajeError && (
        <div
          role="alert"
          className="p-4 rounded-m bg-error-fondo text-error-texto border border-error-texto/20 text-caption font-medio"
        >
          {mensajeError}
        </div>
      )}

      {mensajeExito && (
        <div
          role="status"
          className="p-4 rounded-m bg-exito-fondo text-exito-texto border border-agua-700/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-[10px] font-medio text-caption">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{mensajeExito}</span>
          </div>
          <button
            type="button"
            onClick={() => setMensajeExito(null)}
            className="text-agua-700 font-fuerte text-caption hover:underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {(cita.estado === "PENDIENTE" || cita.estado === "AUTORIZADA") && (
        <ReasignarCita
          cita={cita}
          alReasignar={(datos) => {
            setCita((anterior) => ({ ...anterior, ...datos }));
            setMensajeError(null);
            setMensajeExito("Cita reasignada.");
            router.refresh();
          }}
        />
      )}

      {/* Motivo de Rechazo (si existe) */}
      {cita.motivoRechazo && (
        <div className="p-4 rounded-m bg-error-fondo/60 border border-coral-700/20 text-error-texto">
          <div className="flex items-center gap-2 font-fuerte text-caption mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Motivo de rechazo registrado:</span>
          </div>
          <p className="text-p text-caption leading-relaxed">
            {cita.motivoRechazo}
          </p>
        </div>
      )}

      {/* Grilla Principal de Datos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta 1: Información de la Atención */}
        <div className="p-5 rounded-m bg-fondo-superficie border border-borde-suave  space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-borde-suave text-texto-titulo font-fuerte text-h2">
            <Calendar className="w-5 h-5 text-morado-600" />
            <span>Horario y Servicio</span>
          </div>

          <div className="space-y-3 text-caption">
            <div>
              <span className="block text-texto-secundario text-caption">
                Servicio clínico:
              </span>
              <span className="font-fuerte text-p text-texto-principal">
                {cita.servicio}
              </span>
            </div>

            <div>
              <span className="block text-texto-secundario text-caption">
                Fecha y horario:
              </span>
              <div className="flex items-center gap-2 font-medio text-texto-principal mt-[2px]">
                <Clock className="w-4 h-4 text-morado-600" />
                <span className="capitalize">
                  {formatearFechaLarga(cita.inicio)}
                </span>
                <span className="text-texto-secundario">
                  (hasta {formatearHora(cita.fin)})
                </span>
              </div>
            </div>

            <div>
              <span className="block text-texto-secundario text-caption">
                Terapeuta asignado(a):
              </span>
              <div className="flex items-center gap-2 font-medio text-texto-principal mt-[2px]">
                <User className="w-4 h-4 text-texto-secundario" />
                <span>{cita.psicologoNombre || "Cualquiera disponible"}</span>
              </div>
            </div>

            {cita.venceEn && cita.estado === "PENDIENTE" && (
              <div className="p-3 rounded-m bg-aviso-fondo border border-amarillo-500/20 text-amarillo-700 text-caption">
                Esta solicitud vence el {formatearFechaLarga(cita.venceEn)} si
                no es autorizada.
              </div>
            )}
          </div>
        </div>

        {/* Tarjeta 2: Datos del Paciente / Solicitante */}
        <div className="p-5 rounded-m bg-fondo-superficie border border-borde-suave  space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-borde-suave text-texto-titulo font-fuerte text-h2">
            <User className="w-5 h-5 text-morado-600" />
            <span>Datos del Paciente</span>
          </div>

          <div className="space-y-3 text-caption">
            <div>
              <span className="block text-texto-secundario text-caption">
                Nombre completo:
              </span>
              <span className="font-fuerte text-p text-texto-principal">
                {cita.pacienteNombre || cita.solicitanteNombre}
              </span>
              {cita.pacienteEdad !== null && (
                <span className="text-texto-secundario ml-2 text-caption">
                  ({cita.pacienteEdad} años)
                </span>
              )}
            </div>

            {cita.pacienteDocumento && (
              <div>
                <span className="block text-texto-secundario text-caption">
                  Documento de identidad:
                </span>
                <span className="font-mono text-texto-principal">
                  {cita.pacienteDocumento}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-borde-suave/50">
              <div>
                <span className="block text-texto-secundario text-caption">
                  Teléfono:
                </span>
                <div className="flex items-center gap-[6px] font-medio text-texto-principal mt-[2px]">
                  <Phone className="w-[14px] h-[14px] text-texto-secundario" />
                  <a
                    href={`tel:${cita.solicitanteTelefono}`}
                    className="hover:text-texto-enlace"
                  >
                    {cita.solicitanteTelefono}
                  </a>
                </div>
              </div>

              <div>
                <span className="block text-texto-secundario text-caption">
                  Correo:
                </span>
                <div className="flex items-center gap-[6px] font-medio text-texto-principal mt-[2px] truncate">
                  <Mail className="w-[14px] h-[14px] text-texto-secundario shrink-0" />
                  <a
                    href={`mailto:${cita.solicitanteCorreo}`}
                    className="hover:text-texto-enlace truncate"
                  >
                    {cita.solicitanteCorreo}
                  </a>
                </div>
              </div>
            </div>

            {/* Datos de menor / acudiente si aplica */}
            {cita.paraQuien === "MENOR" && cita.acudienteNombre && (
              <div className="p-3 rounded-m bg-fondo-suave border border-borde-suave text-caption">
                <span className="font-fuerte text-texto-titulo block mb-[2px]">
                  Acudiente responsable:
                </span>
                <span>
                  {cita.acudienteNombre} — Doc: {cita.acudienteDocumento}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tarjeta 3: Motivo de Consulta (Cifrado / Privacidad) */}
      <div className="p-5 rounded-m bg-fondo-superficie border border-borde-suave  space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-borde-suave">
          <div className="flex items-center gap-2 text-texto-titulo font-fuerte text-h2">
            <FileText className="w-5 h-5 text-morado-600" />
            <span>Motivo de Consulta</span>
          </div>
          <span className="text-[11px] font-medio text-agua-700 bg-exito-fondo px-[10px] py-[2px] rounded-pildora border border-agua-500/20">
            Dato clínico cifrado
          </span>
        </div>

        {cita.motivo ? (
          <p className="text-p text-caption leading-relaxed text-texto-principal bg-fondo-suave p-4 rounded-m border border-borde-suave">
            {cita.motivo}
          </p>
        ) : (
          <p className="text-caption text-texto-secundario italic">
            El paciente no incluyó detalles adicionales al solicitar la cita.
          </p>
        )}
      </div>

      {/* Tarjeta 4: Historial de Auditoría y Correos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Historial */}
        <div className="p-5 rounded-m bg-fondo-superficie border border-borde-suave  space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-borde-suave text-texto-titulo font-fuerte text-h2">
            <History className="w-5 h-5 text-morado-600" />
            <span>Historial de Acciones</span>
          </div>

          <div className="space-y-3 text-caption">
            {citaInicial.historial.length > 0 ? (
              <ul className="space-y-[10px] divide-y divide-borde-suave/40">
                {citaInicial.historial.map((h, i) => (
                  <li
                    key={i}
                    className="pt-2 first:pt-0 flex items-start justify-between"
                  >
                    <div>
                      <span className="font-fuerte text-texto-principal block">
                        {h.accion}
                      </span>
                      <span className="text-[11px] text-texto-secundario">
                        {formatearFechaLarga(h.creadaEn)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-caption text-texto-secundario">
                Cita registrada en el sistema.
              </p>
            )}
          </div>
        </div>

        {/* Correos */}
        <div className="p-5 rounded-m bg-fondo-superficie border border-borde-suave  space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-borde-suave text-texto-titulo font-fuerte text-h2">
            <Send className="w-5 h-5 text-morado-600" />
            <span>Notificaciones por Correo</span>
          </div>

          <div className="space-y-2 text-caption">
            {citaInicial.correos.length > 0 ? (
              <ul className="space-y-2">
                {citaInicial.correos.map((cor, i) => (
                  <li
                    key={i}
                    className="p-[10px] rounded-m bg-fondo-suave border border-borde-suave flex items-center justify-between text-caption"
                  >
                    <span className="font-mono text-texto-principal">
                      {cor.llave}
                    </span>
                    <span
                      className={`font-medio px-2 py-[2px] rounded-pildora text-[11px] ${
                        cor.entregado
                          ? "bg-exito-fondo text-agua-700"
                          : "bg-aviso-fondo text-amarillo-700"
                      }`}
                    >
                      {cor.entregado ? "Entregado" : cor.estado}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-caption text-texto-secundario">
                Las notificaciones automáticas aparecerán registradas aquí.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modales de Confirmación */}
      <ModalAccionCita
        abierto={modalAutorizar}
        alCerrar={() => setModalAutorizar(false)}
        titulo="¿Autorizar esta cita?"
        descripcion={`Confirmarás el cupo del ${formatearFechaLarga(cita.inicio)} para ${cita.pacienteNombre || cita.solicitanteNombre}. Se enviará inmediatamente el correo con el enlace y recordatorio.`}
        textoBoton="Sí, autorizar cita"
        variante="exito"
        alConfirmar={ejecutarAutorizar}
      />

      <ModalAccionCita
        abierto={modalRechazar}
        alCerrar={() => setModalRechazar(false)}
        titulo="Rechazar solicitud de cita"
        descripcion="Es obligatorio indicar el motivo del rechazo para que el paciente comprenda la razón y reciba alternativas de atención."
        textoBoton="Rechazar cita"
        variante="peligro"
        requiereMotivo={true}
        placeholderMotivo="Ejemplo: No contamos con disponibilidad en el área requerida o el servicio no aplica..."
        alConfirmar={ejecutarRechazar}
      />

      <ModalAccionCita
        abierto={modalCancelar}
        alCerrar={() => setModalCancelar(false)}
        titulo="Cancelar cita autorizada"
        descripcion="Indica la razón de la cancelación. Esta acción liberará el horario en la agenda y notificará al paciente."
        textoBoton="Confirmar cancelación"
        variante="peligro"
        requiereMotivo={true}
        alConfirmar={ejecutarCancelar}
      />
    </div>
  );
}
