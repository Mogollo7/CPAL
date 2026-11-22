"use client";
import { SIN_CONEXION } from "@/contratos/resultado";

import { useState, useTransition, type FormEvent } from "react";
import {
  CalendarOff,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Flag,
  ShieldCheck,
  X,
} from "lucide-react";
import type { BloqueoGuardado, Festivo } from "@/contratos/bloqueo";
import {
  crearBloqueoCentroAccion,
  eliminarBloqueoCentroAccion,
} from "@/servidor/acciones";

interface GestorBloqueosProps {
  bloqueosIniciales: BloqueoGuardado[];
  festivos: Festivo[];
}

function formatearFechaBogota(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Bogota",
    }).format(d);
  } catch {
    return isoString;
  }
}

function formatearDiaFestivo(fechaStr: string): string {
  try {
    const [y, m, d] = fechaStr.split("-").map(Number);
    const fecha = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(fecha);
  } catch {
    return fechaStr;
  }
}

export function GestorBloqueos({
  bloqueosIniciales,
  festivos,
}: GestorBloqueosProps) {
  const [bloqueos, setBloqueos] =
    useState<BloqueoGuardado[]>(bloqueosIniciales);
  const [modalCrear, setModalCrear] = useState(false);

  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [motivo, setMotivo] = useState("");

  const [mensaje, setMensaje] = useState<{
    tipo: "exito" | "error";
    texto: string;
  } | null>(null);
  const [guardando, iniciarTransicion] = useTransition();

  const manejarCrearBloqueo = (e: FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    const dDesde = new Date(desde);
    const dHasta = new Date(hasta);

    if (dHasta <= dDesde) {
      setMensaje({
        tipo: "error",
        texto: "La fecha y hora final debe ser posterior al inicio.",
      });
      return;
    }

    iniciarTransicion(async () => {
      try {
        const res = await crearBloqueoCentroAccion({
          desde: dDesde.toISOString(),
          hasta: dHasta.toISOString(),
          motivo: motivo.trim() || undefined,
        });

        if (res.ok) {
          setBloqueos((prev) => [...prev, res.datos]);
          setModalCrear(false);
          setDesde("");
          setHasta("");
          setMotivo("");
          setMensaje({
            tipo: "exito",
            texto: "Fecha bloqueada para todo el centro con éxito.",
          });
        } else {
          setMensaje({
            tipo: "error",
            texto: res.mensaje || "Error al registrar el bloqueo.",
          });
        }
      } catch {
        setMensaje({ tipo: "error", texto: SIN_CONEXION });
      }
    });
  };

  const manejarEliminarBloqueo = async (id: string) => {
    setMensaje(null);
    try {
      const res = await eliminarBloqueoCentroAccion(id);
      if (res.ok) {
        setBloqueos((prev) => prev.filter((b) => b.id !== id));
        setMensaje({
          tipo: "exito",
          texto: "Bloqueo eliminado correctamente.",
        });
      } else {
        setMensaje({
          tipo: "error",
          texto: res.mensaje || "Error al eliminar.",
        });
      }
    } catch {
      setMensaje({ tipo: "error", texto: SIN_CONEXION });
    }
  };

  return (
    <div className="space-y-5 w-full">
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

      {/* SECCIÓN 1: BLOQUEOS GENERALES DEL CENTRO (RF-ADM-09) */}
      <div className="space-y-5 rounded-m border border-borde-suave bg-fondo-superficie p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-borde-suave pb-4">
          <div>
            <h3 className="text-h2 font-fuerte text-texto-titulo flex items-center gap-2">
              <CalendarOff className="w-5 h-5 text-morado-600" />
              <span>Bloqueos Globales del Centro</span>
            </h3>
            <p className="text-caption text-texto-secundario mt-[2px]">
              Periodos no laborables para todos los terapeutas (vacaciones
              institucionales, jornadas académicas o mantenimiento).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalCrear(true)}
            className="inline-flex min-h-[44px] items-center gap-2 px-5 py-[10px] rounded-m bg-accion-fondo text-accion-texto text-caption font-fuerte hover:bg-accion-fondo-activo transition-all  cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Bloquear periodo</span>
          </button>
        </div>

        {/* Lista de Bloqueos Globales */}
        <div className="space-y-3">
          {bloqueos.map((b) => (
            <div
              key={b.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 rounded-m border border-borde-suave bg-fondo-suave/60 p-3 text-caption transition-colors hover:border-morado-300"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-fuerte text-texto-titulo">
                  <Calendar className="w-4 h-4 text-morado-600" />
                  <span>
                    Del {formatearFechaBogota(b.desde)} al{" "}
                    {formatearFechaBogota(b.hasta)}
                  </span>
                </div>
                {b.motivo && (
                  <p className="text-caption text-texto-secundario">
                    <span className="font-medio">Motivo:</span> {b.motivo}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => manejarEliminarBloqueo(b.id)}
                className="inline-flex size-[44px] items-center justify-center rounded-s text-error-texto transition-colors hover:bg-error-fondo/60"
                title="Eliminar este bloqueo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {bloqueos.length === 0 && (
            <p className="text-center py-5 text-caption text-texto-secundario italic">
              No hay bloqueos globales activos. Las citas se calculan únicamente
              considerando los horarios de cada psicólogo y los festivos
              nacionales.
            </p>
          )}
        </div>
      </div>

      {/* SECCIÓN 2: FESTIVOS NACIONALES AUTOMÁTICOS (RF-ADM-13) */}
      <div className="space-y-5 rounded-m border border-borde-suave bg-fondo-superficie p-4 sm:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-borde-suave">
          <div className="flex items-center gap-[10px]">
            <Flag className="w-5 h-5 text-amarillo-700" />
            <div>
              <h3 className="text-h2 font-fuerte text-texto-titulo">
                Festivos de Colombia (Bloqueo Automático)
              </h3>
              <p className="text-caption text-texto-secundario mt-[2px]">
                Calendario oficial colombiano (Ley Emiliani) integrado en el
                motor de cupos.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-[6px] px-3 py-1 rounded-pildora text-caption font-fuerte bg-exito-fondo text-agua-700 border border-agua-500/30">
            <ShieldCheck className="w-[14px] h-[14px]" />
            <span>Sincronizado</span>
          </span>
        </div>

        <div className="p-4 rounded-m bg-aviso-fondo/60 border border-amarillo-500/20 text-amarillo-700 text-caption text-caption leading-relaxed">
          <p>
            Los festivos nacionales no requieren configuración manual. La
            plataforma calcula automáticamente los días de fiesta civil y
            religiosa cada año y deshabilita la disponibilidad de turnos en esas
            fechas.
          </p>
        </div>

        {/* Grilla de Días Festivos del Año */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-3">
          {festivos.map((f, i) => (
            <div
              key={i}
              className="p-[14px] rounded-m bg-fondo-suave/40 border border-borde-suave text-caption space-y-1"
            >
              <span className="font-mono text-caption font-fuerte text-morado-900 block">
                {f.fecha}
              </span>
              <p className="font-fuerte text-texto-titulo text-caption leading-snug">
                {f.nombre}
              </p>
              <span className="text-caption text-texto-secundario capitalize block">
                {formatearDiaFestivo(f.fecha)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL CREAR BLOQUEO */}
      {modalCrear && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-morado-900/40 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-formulario-bloqueo"
        >
          <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-m border border-borde-suave bg-fondo-superficie p-4 shadow-flotante sm:p-6">
            <button
              type="button"
              onClick={() => setModalCrear(false)}
              className="absolute top-2 right-2 inline-flex size-[44px] items-center justify-center rounded-s text-texto-secundario hover:text-texto-principal"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <h3
              id="titulo-formulario-bloqueo"
              className="pr-[44px] text-h2 font-fuerte text-texto-titulo mb-1"
            >
              Bloquear Periodo General
            </h3>
            <p className="text-caption text-texto-secundario mb-4 text-caption">
              Durante este rango de fechas no se agendarán citas para ningún
              servicio ni terapeuta.
            </p>

            <form
              onSubmit={manejarCrearBloqueo}
              className="space-y-4 text-caption"
            >
              <div>
                <label
                  htmlFor="bloqueo-desde"
                  className="block font-medio text-texto-principal mb-1"
                >
                  Desde (Fecha y hora)
                </label>
                <input
                  id="bloqueo-desde"
                  type="datetime-local"
                  required
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="w-full min-w-0 max-w-full p-[10px] rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
                />
              </div>

              <div>
                <label
                  htmlFor="bloqueo-hasta"
                  className="block font-medio text-texto-principal mb-1"
                >
                  Hasta (Fecha y hora)
                </label>
                <input
                  id="bloqueo-hasta"
                  type="datetime-local"
                  required
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="w-full min-w-0 max-w-full p-[10px] rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
                />
              </div>

              <div>
                <label
                  htmlFor="bloqueo-motivo"
                  className="block font-medio text-texto-principal mb-1"
                >
                  Motivo institucional (opcional)
                </label>
                <input
                  id="bloqueo-motivo"
                  type="text"
                  maxLength={200}
                  placeholder="Ej. Vacaciones colectivas de fin de año"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full min-w-0 max-w-full p-[10px] rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-borde-suave pt-3 [&>button]:min-h-[44px]">
                <button
                  type="button"
                  onClick={() => setModalCrear(false)}
                  className="px-4 py-2 rounded-m border border-borde-control hover:bg-fondo-suave cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 rounded-m bg-accion-fondo text-accion-texto font-fuerte hover:bg-accion-fondo-activo cursor-pointer disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Confirmar bloqueo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
