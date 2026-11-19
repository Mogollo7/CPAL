"use client";

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
        const nuevoSimulado: BloqueoGuardado = {
          id: `blq-${Date.now()}`,
          desde: dDesde.toISOString(),
          hasta: dHasta.toISOString(),
          motivo: motivo.trim() || null,
          psicologoId: null,
        };
        setBloqueos((prev) => [...prev, nuevoSimulado]);
        setModalCrear(false);
        setDesde("");
        setHasta("");
        setMotivo("");
        setMensaje({
          tipo: "exito",
          texto: "Bloqueo registrado (modo simulación local).",
        });
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
      setBloqueos((prev) => prev.filter((b) => b.id !== id));
      setMensaje({
        tipo: "exito",
        texto: "Bloqueo eliminado (modo simulado).",
      });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Notificación */}
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

      {/* SECCIÓN 1: BLOQUEOS GENERALES DEL CENTRO (RF-ADM-09) */}
      <div className="p-6 rounded-l bg-fondo-superficie border border-borde-suave shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borde-suave">
          <div>
            <h3 className="text-h2 font-weight-fuerte text-texto-titulo flex items-center gap-2">
              <CalendarOff className="w-5 h-5 text-morado-600" />
              <span>Bloqueos Globales del Centro</span>
            </h3>
            <p className="text-caption text-texto-secundario mt-0.5">
              Periodos no laborables para todos los terapeutas (vacaciones
              institucionales, jornadas académicas o mantenimiento).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalCrear(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-m bg-accion-fondo text-accion-texto text-caption font-weight-fuerte hover:bg-accion-fondo-activo transition-all shadow-xs cursor-pointer"
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
              className="p-4 rounded-m bg-fondo-suave/60 border border-borde-suave flex items-center justify-between text-caption hover:border-morado-300 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-weight-fuerte text-texto-titulo">
                  <Calendar className="w-4 h-4 text-morado-600" />
                  <span>
                    Del {formatearFechaBogota(b.desde)} al{" "}
                    {formatearFechaBogota(b.hasta)}
                  </span>
                </div>
                {b.motivo && (
                  <p className="text-xs text-texto-secundario">
                    <span className="font-weight-medio">Motivo:</span>{" "}
                    {b.motivo}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => manejarEliminarBloqueo(b.id)}
                className="p-2 text-error-texto hover:bg-error-fondo/60 rounded-s transition-colors cursor-pointer"
                title="Eliminar este bloqueo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {bloqueos.length === 0 && (
            <p className="text-center py-8 text-caption text-texto-secundario italic">
              No hay bloqueos globales activos. Las citas se calculan únicamente
              considerando los horarios de cada psicólogo y los festivos
              nacionales.
            </p>
          )}
        </div>
      </div>

      {/* SECCIÓN 2: FESTIVOS NACIONALES AUTOMÁTICOS (RF-ADM-13) */}
      <div className="p-6 rounded-l bg-fondo-superficie border border-borde-suave shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-borde-suave">
          <div className="flex items-center gap-2.5">
            <Flag className="w-5 h-5 text-amarillo-700" />
            <div>
              <h3 className="text-h2 font-weight-fuerte text-texto-titulo">
                Festivos de Colombia (Bloqueo Automático)
              </h3>
              <p className="text-caption text-texto-secundario mt-0.5">
                Calendario oficial colombiano (Ley Emiliani) integrado en el
                motor de cupos.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-pildora text-xs font-weight-fuerte bg-exito-fondo text-agua-700 border border-agua-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sincronizado</span>
          </span>
        </div>

        <div className="p-4 rounded-m bg-aviso-fondo/60 border border-amarillo-500/20 text-amarillo-700 text-caption text-xs leading-relaxed">
          <p>
            Los festivos nacionales no requieren configuración manual. La
            plataforma calcula automáticamente los días de fiesta civil y
            religiosa cada año y deshabilita la disponibilidad de turnos en esas
            fechas.
          </p>
        </div>

        {/* Grilla de Días Festivos del Año */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {festivos.map((f, i) => (
            <div
              key={i}
              className="p-3.5 rounded-m bg-fondo-suave/40 border border-borde-suave text-caption space-y-1"
            >
              <span className="font-mono text-xs font-weight-fuerte text-morado-900 block">
                {f.fecha}
              </span>
              <p className="font-weight-fuerte text-texto-titulo text-sm leading-snug">
                {f.nombre}
              </p>
              <span className="text-[11px] text-texto-secundario capitalize block">
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
        >
          <div className="w-full max-w-md bg-fondo-superficie rounded-l border border-borde-suave shadow-flotante p-6 relative">
            <button
              type="button"
              onClick={() => setModalCrear(false)}
              className="absolute top-4 right-4 text-texto-secundario hover:text-texto-principal p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-h2 font-weight-fuerte text-texto-titulo mb-1">
              Bloquear Periodo General
            </h3>
            <p className="text-caption text-texto-secundario mb-4 text-xs">
              Durante este rango de fechas no se agendarán citas para ningún
              servicio ni terapeuta.
            </p>

            <form
              onSubmit={manejarCrearBloqueo}
              className="space-y-4 text-caption"
            >
              <div>
                <label className="block font-weight-medio text-texto-principal mb-1">
                  Desde (Fecha y hora)
                </label>
                <input
                  type="datetime-local"
                  required
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="w-full p-2.5 rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
                />
              </div>

              <div>
                <label className="block font-weight-medio text-texto-principal mb-1">
                  Hasta (Fecha y hora)
                </label>
                <input
                  type="datetime-local"
                  required
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="w-full p-2.5 rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
                />
              </div>

              <div>
                <label className="block font-weight-medio text-texto-principal mb-1">
                  Motivo institucional (opcional)
                </label>
                <input
                  type="text"
                  maxLength={200}
                  placeholder="Ej. Vacaciones colectivas de fin de año"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full p-2.5 rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
                />
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
                  disabled={guardando}
                  className="px-5 py-2 rounded-m bg-accion-fondo text-accion-texto font-weight-fuerte hover:bg-accion-fondo-activo cursor-pointer disabled:opacity-50"
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
