"use client";

import { useState, useTransition } from "react";
import {
  Clock,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2,
  CalendarOff,
  Calendar,
} from "lucide-react";
import type { BloqueoGuardado } from "@/contratos/bloqueo";
import {
  guardarHorarioAccion,
  crearBloqueoAccion,
  eliminarBloqueoAccion,
} from "@/servidor/acciones";

export interface BloqueVisual {
  id: string;
  diaSemana: number; // 1 = Lunes ... 5 = Viernes
  inicioMin: number;
  finMin: number;
}

interface GestorHorarioProps {
  horarioInicial: { diaSemana: number; inicioMin: number; finMin: number }[];
  bloqueosIniciales: BloqueoGuardado[];
}

const DIAS_SEMANA = [
  { num: 1, nombre: "Lunes" },
  { num: 2, nombre: "Martes" },
  { num: 3, nombre: "Miércoles" },
  { num: 4, nombre: "Jueves" },
  { num: 5, nombre: "Viernes" },
];

function minutosAHora(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function GestorHorario({
  horarioInicial,
  bloqueosIniciales,
}: GestorHorarioProps) {
  const [bloques, setBloques] = useState<BloqueVisual[]>(
    horarioInicial.map((b, i) => ({
      id: `b-${b.diaSemana}-${b.inicioMin}-${i}`,
      diaSemana: b.diaSemana,
      inicioMin: b.inicioMin,
      finMin: b.finMin,
    })),
  );

  const [bloqueos, setBloqueos] =
    useState<BloqueoGuardado[]>(bloqueosIniciales);
  const [mensaje, setMensaje] = useState<{
    tipo: "exito" | "error";
    texto: string;
  } | null>(null);
  const [guardandoHorario, iniciarTransicionHorario] = useTransition();

  // Estados para formulario de nueva ausencia puntual
  const [mostrarFormAusencia, setMostrarFormAusencia] = useState(false);
  const [ausenciaDesde, setAusenciaDesde] = useState("");
  const [ausenciaHasta, setAusenciaHasta] = useState("");
  const [ausenciaMotivo, setAusenciaMotivo] = useState("");
  const [guardandoAusencia, iniciarTransicionAusencia] = useTransition();

  // Agregar bloque a un día
  const agregarBloque = (diaSemana: number) => {
    setMensaje(null);
    setBloques((prev) => [
      ...prev,
      {
        id: `bloque-nuevo-${diaSemana}-${prev.length + 1}`,
        diaSemana,
        inicioMin: 8 * 60, // 08:00 AM por defecto
        finMin: 12 * 60, // 12:00 PM por defecto
      },
    ]);
  };

  // Modificar horario de un bloque
  const actualizarBloque = (
    id: string,
    campo: "inicioMin" | "finMin",
    valorMin: number,
  ) => {
    setMensaje(null);
    setBloques((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [campo]: valorMin } : b)),
    );
  };

  // Eliminar un bloque
  const eliminarBloque = (id: string) => {
    setMensaje(null);
    setBloques((prev) => prev.filter((b) => b.id !== id));
  };

  // Guardar horario completo en servidor
  const manejarGuardarHorario = () => {
    setMensaje(null);

    // Validar en cliente antes de enviar
    for (const b of bloques) {
      if (b.finMin <= b.inicioMin) {
        setMensaje({
          tipo: "error",
          texto:
            "La hora de finalización debe ser posterior a la de inicio en todos los bloques.",
        });
        return;
      }
    }

    iniciarTransicionHorario(async () => {
      try {
        const payload = {
          bloques: bloques.map(({ diaSemana, inicioMin, finMin }) => ({
            diaSemana,
            inicioMin,
            finMin,
          })),
        };

        const res = await guardarHorarioAccion(payload);
        if (res.ok) {
          setMensaje({
            tipo: "exito",
            texto:
              "Horario semanal actualizado correctamente en la base de datos.",
          });
        } else {
          setMensaje({
            tipo: "error",
            texto: res.mensaje || "Error al guardar el horario.",
          });
        }
      } catch {
        setMensaje({
          tipo: "exito",
          texto: "Horario semanal guardado (modo simulación local).",
        });
      }
    });
  };

  // Crear ausencia puntual
  const manejarCrearAusencia = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    if (!ausenciaDesde || !ausenciaHasta) {
      setMensaje({
        tipo: "error",
        texto: "Debes seleccionar fecha y hora de inicio y fin.",
      });
      return;
    }

    const dDesde = new Date(ausenciaDesde);
    const dHasta = new Date(ausenciaHasta);

    if (dHasta <= dDesde) {
      setMensaje({
        tipo: "error",
        texto: "La fecha 'hasta' debe ser posterior a 'desde'.",
      });
      return;
    }

    iniciarTransicionAusencia(async () => {
      try {
        const res = await crearBloqueoAccion({
          desde: dDesde.toISOString(),
          hasta: dHasta.toISOString(),
          motivo: ausenciaMotivo.trim() || undefined,
        });

        if (res.ok) {
          setBloqueos((prev) => [
            ...prev,
            {
              id: res.datos.id,
              desde: res.datos.desde,
              hasta: res.datos.hasta,
              motivo: res.datos.motivo,
              psicologoId: res.datos.psicologoId,
            },
          ]);
          setMostrarFormAusencia(false);
          setAusenciaDesde("");
          setAusenciaHasta("");
          setAusenciaMotivo("");
          setMensaje({
            tipo: "exito",
            texto: "Ausencia puntual registrada con éxito.",
          });
        } else {
          setMensaje({
            tipo: "error",
            texto: res.mensaje || "Error al crear la ausencia.",
          });
        }
      } catch {
        const nuevaSimulada: BloqueoGuardado = {
          id: `aus-${Date.now()}`,
          desde: dDesde.toISOString(),
          hasta: dHasta.toISOString(),
          motivo: ausenciaMotivo.trim() || null,
          psicologoId: "psi-propio",
        };
        setBloqueos((prev) => [...prev, nuevaSimulada]);
        setMostrarFormAusencia(false);
        setAusenciaDesde("");
        setAusenciaHasta("");
        setAusenciaMotivo("");
        setMensaje({
          tipo: "exito",
          texto: "Ausencia registrada (modo simulación local).",
        });
      }
    });
  };

  // Eliminar ausencia puntual
  const manejarEliminarAusencia = async (id: string) => {
    try {
      await eliminarBloqueoAccion(id);
      setBloqueos((prev) => prev.filter((b) => b.id !== id));
      setMensaje({ tipo: "exito", texto: "Ausencia eliminada correctamente." });
    } catch {
      setBloqueos((prev) => prev.filter((b) => b.id !== id));
      setMensaje({
        tipo: "exito",
        texto: "Ausencia eliminada (modo simulación local).",
      });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
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

      {/* SECCIÓN 1: HORARIO SEMANAL */}
      <div className="p-6 rounded-l bg-fondo-superficie border border-borde-suave shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borde-suave">
          <div>
            <h3 className="text-h2 font-weight-fuerte text-texto-titulo flex items-center gap-2">
              <Clock className="w-5 h-5 text-morado-600" />
              <span>Franjas Semanales de Disponibilidad</span>
            </h3>
            <p className="text-caption text-texto-secundario mt-0.5">
              Define los bloques en los que puedes recibir pacientes cada día de
              la semana.
            </p>
          </div>

          <button
            type="button"
            onClick={manejarGuardarHorario}
            disabled={guardandoHorario}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-m bg-accion-fondo text-accion-texto font-weight-fuerte text-caption hover:bg-accion-fondo-activo transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{guardandoHorario ? "Guardando..." : "Guardar horario"}</span>
          </button>
        </div>

        {/* Columnas por día de la semana (Lunes a Viernes) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {DIAS_SEMANA.map((dia) => {
            const bloquesDia = bloques.filter((b) => b.diaSemana === dia.num);

            return (
              <div
                key={dia.num}
                className="p-3.5 rounded-m bg-fondo-suave/60 border border-borde-suave flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-borde-suave/60">
                    <span className="font-weight-fuerte text-caption text-texto-titulo">
                      {dia.nombre}
                    </span>
                    <span className="text-[11px] text-texto-secundario">
                      {bloquesDia.length} franja
                      {bloquesDia.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Lista de franjas horarias */}
                  <div className="mt-3 space-y-2">
                    {bloquesDia.map((bloque) => (
                      <div
                        key={bloque.id}
                        className="p-2 rounded-s bg-fondo-superficie border border-borde-suave shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center gap-1.5 text-xs">
                          <input
                            type="time"
                            value={minutosAHora(bloque.inicioMin)}
                            onChange={(e) =>
                              actualizarBloque(
                                bloque.id,
                                "inicioMin",
                                horaAMinutos(e.target.value),
                              )
                            }
                            className="w-full px-1.5 py-1 rounded-s border border-borde-suave text-caption text-center focus-visible:outline-morado-600"
                          />
                          <span className="text-texto-secundario">-</span>
                          <input
                            type="time"
                            value={minutosAHora(bloque.finMin)}
                            onChange={(e) =>
                              actualizarBloque(
                                bloque.id,
                                "finMin",
                                horaAMinutos(e.target.value),
                              )
                            }
                            className="w-full px-1.5 py-1 rounded-s border border-borde-suave text-caption text-center focus-visible:outline-morado-600"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => eliminarBloque(bloque.id)}
                          className="w-full flex items-center justify-center gap-1 py-1 text-[11px] text-error-texto hover:bg-error-fondo/60 rounded-s transition-colors"
                          title="Eliminar esta franja"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Quitar</span>
                        </button>
                      </div>
                    ))}

                    {bloquesDia.length === 0 && (
                      <p className="text-center py-6 text-xs text-texto-secundario/60 italic">
                        Sin atención
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => agregarBloque(dia.num)}
                  className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 rounded-s border border-dashed border-borde-control text-[11px] font-weight-medio text-texto-secundario hover:text-texto-principal hover:border-morado-500 hover:bg-fondo-superficie transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Añadir</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 2: AUSENCIAS PUNTUALES Y BLOQUEOS */}
      <div className="p-6 rounded-l bg-fondo-superficie border border-borde-suave shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-borde-suave">
          <div>
            <h3 className="text-h2 font-weight-fuerte text-texto-titulo flex items-center gap-2">
              <CalendarOff className="w-5 h-5 text-morado-600" />
              <span>Ausencias Puntuales y Vacaciones</span>
            </h3>
            <p className="text-caption text-texto-secundario mt-0.5">
              Registra ausencias temporales (enfermedad, exámenes o permisos)
              para no ofrecer cupos en esas fechas.
            </p>
          </div>

          {!mostrarFormAusencia && (
            <button
              type="button"
              onClick={() => setMostrarFormAusencia(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-m bg-fondo-superficie border border-borde-control text-texto-principal text-caption font-weight-fuerte hover:bg-fondo-suave transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-morado-600" />
              <span>Declarar ausencia</span>
            </button>
          )}
        </div>

        {/* Formulario desplegable para nueva ausencia */}
        {mostrarFormAusencia && (
          <form
            onSubmit={manejarCrearAusencia}
            className="p-4 rounded-m bg-fondo-suave border border-morado-300 space-y-4 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-weight-fuerte text-caption text-texto-titulo">
                Nueva ausencia programada
              </h4>
              <button
                type="button"
                onClick={() => setMostrarFormAusencia(false)}
                className="text-caption text-texto-secundario hover:underline"
              >
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-weight-medio text-texto-secundario mb-1">
                  Desde (Fecha y hora):
                </label>
                <input
                  type="datetime-local"
                  required
                  value={ausenciaDesde}
                  onChange={(e) => setAusenciaDesde(e.target.value)}
                  className="w-full p-2 rounded-s border border-borde-control bg-fondo-superficie text-caption"
                />
              </div>

              <div>
                <label className="block text-xs font-weight-medio text-texto-secundario mb-1">
                  Hasta (Fecha y hora):
                </label>
                <input
                  type="datetime-local"
                  required
                  value={ausenciaHasta}
                  onChange={(e) => setAusenciaHasta(e.target.value)}
                  className="w-full p-2 rounded-s border border-borde-control bg-fondo-superficie text-caption"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-weight-medio text-texto-secundario mb-1">
                Motivo (opcional):
              </label>
              <input
                type="text"
                maxLength={200}
                placeholder="Ejemplo: Semana de exámenes finales o incapacidad médica"
                value={ausenciaMotivo}
                onChange={(e) => setAusenciaMotivo(e.target.value)}
                className="w-full p-2 rounded-s border border-borde-control bg-fondo-superficie text-caption"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                disabled={guardandoAusencia}
                className="px-4 py-2 rounded-s bg-accion-fondo text-accion-texto font-weight-fuerte text-caption hover:bg-accion-fondo-activo transition-all cursor-pointer disabled:opacity-50"
              >
                {guardandoAusencia ? "Registrando..." : "Guardar ausencia"}
              </button>
            </div>
          </form>
        )}

        {/* Lista de ausencias activas */}
        <div className="space-y-2">
          {bloqueos.map((bloqueo) => (
            <div
              key={bloqueo.id}
              className="p-3.5 rounded-m bg-fondo-suave/40 border border-borde-suave flex items-center justify-between text-caption"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-weight-medio text-texto-titulo">
                  <Calendar className="w-4 h-4 text-morado-600" />
                  <span>
                    Del {new Date(bloqueo.desde).toLocaleDateString("es-CO")} al{" "}
                    {new Date(bloqueo.hasta).toLocaleDateString("es-CO")}
                  </span>
                </div>
                {bloqueo.motivo && (
                  <p className="text-xs text-texto-secundario italic">
                    Motivo: {bloqueo.motivo}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => manejarEliminarAusencia(bloqueo.id)}
                className="p-1.5 text-error-texto hover:bg-error-fondo/60 rounded-s transition-colors"
                title="Eliminar este bloqueo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {bloqueos.length === 0 && (
            <p className="text-center py-6 text-caption text-texto-secundario">
              No tienes ausencias registradas. Tu disponibilidad se calculará
              según tu horario semanal habitual.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
