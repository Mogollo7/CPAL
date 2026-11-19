"use client";

import {
  useState,
  useTransition,
  type FormEvent,
  type ChangeEvent,
} from "react";
import {
  Plus,
  Calendar,
  MapPin,
  ExternalLink,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
} from "lucide-react";
import type { EventoDetalle } from "@/contratos/evento";
import {
  crearEventoAccion,
  editarEventoAccion,
  subirImagenEventoAccion,
} from "@/servidor/acciones";

interface GestorEventosProps {
  eventosIniciales: EventoDetalle[];
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

export function GestorEventos({ eventosIniciales }: GestorEventosProps) {
  const [eventos, setEventos] = useState<EventoDetalle[]>(eventosIniciales);
  const [modalCrear, setModalCrear] = useState(false);
  const [eventoAEditar, setEventoAEditar] = useState<EventoDetalle | null>(
    null,
  );

  // Formulario de creación / edición
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [lugar, setLugar] = useState("");
  const [enlace, setEnlace] = useState("");
  const [publicado, setPublicado] = useState(true);

  const [mensaje, setMensaje] = useState<{
    tipo: "exito" | "error";
    texto: string;
  } | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();

  // Abrir creación
  const abrirCreacion = () => {
    setTitulo("");
    setDescripcion("");
    setInicio("");
    setFin("");
    setLugar("Bloque 3, auditorio");
    setEnlace("");
    setPublicado(true);
    setModalCrear(true);
  };

  // Abrir edición
  const abrirEdicion = (ev: EventoDetalle) => {
    setEventoAEditar(ev);
    setTitulo(ev.titulo);
    setDescripcion(ev.descripcion);
    setInicio(ev.inicio.slice(0, 16));
    setFin(ev.fin ? ev.fin.slice(0, 16) : "");
    setLugar(ev.lugar);
    setEnlace(ev.enlace || "");
    setPublicado(ev.publicado);
  };

  // Guardar evento (crear o editar)
  const manejarGuardar = (e: FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    const payload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      inicio: new Date(inicio).toISOString(),
      fin: fin ? new Date(fin).toISOString() : undefined,
      lugar: lugar.trim(),
      enlace: enlace.trim() || undefined,
      publicado,
    };

    iniciarTransicion(async () => {
      try {
        if (eventoAEditar) {
          const res = await editarEventoAccion(eventoAEditar.id, payload);
          if (res.ok) {
            setEventos((prev) =>
              prev.map((ev) => (ev.id === eventoAEditar.id ? res.datos : ev)),
            );
            setEventoAEditar(null);
            setMensaje({
              tipo: "exito",
              texto: "Evento actualizado correctamente.",
            });
          } else {
            setMensaje({
              tipo: "error",
              texto: res.mensaje || "Error al actualizar evento.",
            });
          }
        } else {
          const res = await crearEventoAccion(payload);
          if (res.ok) {
            setEventos((prev) => [res.datos, ...prev]);
            setModalCrear(false);
            setMensaje({
              tipo: "exito",
              texto: "Evento creado y publicado en la cartelera.",
            });
          } else {
            setMensaje({
              tipo: "error",
              texto: res.mensaje || "Error al crear evento.",
            });
          }
        }
      } catch {
        // En simulación local
        if (eventoAEditar) {
          setEventos((prev) =>
            prev.map((ev) =>
              ev.id === eventoAEditar.id
                ? {
                    ...ev,
                    ...payload,
                    fin: payload.fin || null,
                    enlace: payload.enlace || null,
                  }
                : ev,
            ),
          );
          setEventoAEditar(null);
          setMensaje({
            tipo: "exito",
            texto: "Evento actualizado (modo simulado).",
          });
        } else {
          const nuevoSimulado: EventoDetalle = {
            id: `ev-${Date.now()}`,
            slug: titulo.toLowerCase().replace(/\s+/g, "-"),
            titulo: payload.titulo,
            descripcion: payload.descripcion,
            inicio: payload.inicio,
            fin: payload.fin || null,
            lugar: payload.lugar,
            enlace: payload.enlace || null,
            imagenUrl: null,
            publicado: payload.publicado,
          };
          setEventos((prev) => [nuevoSimulado, ...prev]);
          setModalCrear(false);
          setMensaje({
            tipo: "exito",
            texto: "Evento creado (modo simulado).",
          });
        }
      }
    });
  };

  // Subir imagen / afiche de evento
  const manejarSubirImagen = (
    eventoId: string,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("imagen", file);

    iniciarTransicion(async () => {
      try {
        const res = await subirImagenEventoAccion(eventoId, formData);
        if (res.ok) {
          setEventos((prev) =>
            prev.map((ev) => (ev.id === eventoId ? res.datos : ev)),
          );
          setMensaje({
            tipo: "exito",
            texto: "Imagen del evento actualizada.",
          });
        } else {
          setMensaje({
            tipo: "error",
            texto: res.mensaje || "Error al subir imagen.",
          });
        }
      } catch {
        const urlLocal = URL.createObjectURL(file);
        setEventos((prev) =>
          prev.map((ev) =>
            ev.id === eventoId ? { ...ev, imagenUrl: urlLocal } : ev,
          ),
        );
        setMensaje({
          tipo: "exito",
          texto: "Imagen actualizada (modo simulado).",
        });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
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

      {/* Botón Superior */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={abrirCreacion}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-m bg-accion-fondo text-accion-texto text-caption font-weight-fuerte hover:bg-accion-fondo-activo transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo evento</span>
        </button>
      </div>

      {/* Grilla de Eventos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {eventos.map((ev) => (
          <div
            key={ev.id}
            className="p-5 rounded-l bg-fondo-superficie border border-borde-suave shadow-xs flex flex-col justify-between hover:border-morado-300 transition-all space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-pildora text-[11px] font-weight-fuerte border ${
                    ev.publicado
                      ? "bg-exito-fondo text-agua-700 border-agua-500/20"
                      : "bg-fondo-suave text-texto-secundario border-borde-suave"
                  }`}
                >
                  {ev.publicado ? "Publicado en web" : "Borrador privado"}
                </span>

                <button
                  type="button"
                  onClick={() => abrirEdicion(ev)}
                  className="p-1.5 text-texto-secundario hover:text-texto-principal hover:bg-fondo-suave rounded-s"
                  title="Editar evento"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h4 className="text-h2 font-weight-fuerte text-texto-titulo">
                  {ev.titulo}
                </h4>
                <p className="text-caption text-texto-secundario mt-1 line-clamp-2 leading-relaxed">
                  {ev.descripcion}
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-texto-principal pt-2 border-t border-borde-suave/60">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-morado-600" />
                  <span>{formatearFechaBogota(ev.inicio)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-texto-secundario" />
                  <span>{ev.lugar}</span>
                </div>

                {ev.enlace && (
                  <div className="flex items-center gap-2 truncate">
                    <ExternalLink className="w-3.5 h-3.5 text-texto-enlace shrink-0" />
                    <a
                      href={ev.enlace}
                      target="_blank"
                      className="text-texto-enlace hover:underline truncate"
                    >
                      {ev.enlace}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Subida de Imagen / Afiche */}
            <div className="pt-3 border-t border-borde-suave flex items-center justify-between">
              <span className="text-[11px] text-texto-secundario">
                {ev.imagenUrl ? "Afiche cargado ✓" : "Sin afiche promocional"}
              </span>

              <label
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-s bg-fondo-suave border border-borde-suave text-xs font-weight-medio text-texto-principal hover:bg-fondo-superficie cursor-pointer transition-colors"
                title="Subir afiche"
              >
                <Upload className="w-3 h-3 text-texto-secundario" />
                <span>{ev.imagenUrl ? "Cambiar afiche" : "Subir afiche"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => manejarSubirImagen(ev.id, e)}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CREAR / EDITAR EVENTO */}
      {(modalCrear || eventoAEditar) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-morado-900/40 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-fondo-superficie rounded-l border border-borde-suave shadow-flotante p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                setModalCrear(false);
                setEventoAEditar(null);
              }}
              className="absolute top-4 right-4 text-texto-secundario hover:text-texto-principal p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-h2 font-weight-fuerte text-texto-titulo mb-4">
              {eventoAEditar ? "Editar Evento" : "Crear Nuevo Evento"}
            </h3>

            <form onSubmit={manejarGuardar} className="space-y-4 text-caption">
              <div>
                <label className="block font-weight-medio text-texto-principal mb-1">
                  Título del evento (máx. 120 caracteres)
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Taller de primeros auxilios psicológicos"
                  className="w-full p-2.5 rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
                />
              </div>

              <div>
                <label className="block font-weight-medio text-texto-principal mb-1">
                  Descripción del taller o charla
                </label>
                <textarea
                  rows={3}
                  required
                  maxLength={2000}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe los temas, objetivos y a quién va dirigido..."
                  className="w-full p-2.5 rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-weight-medio text-texto-principal mb-1">
                    Fecha y hora de inicio:
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={inicio}
                    onChange={(e) => setInicio(e.target.value)}
                    className="w-full p-2 rounded-m border border-borde-control bg-fondo-superficie text-caption"
                  />
                </div>

                <div>
                  <label className="block font-weight-medio text-texto-principal mb-1">
                    Fecha y hora de fin (opcional):
                  </label>
                  <input
                    type="datetime-local"
                    value={fin}
                    onChange={(e) => setFin(e.target.value)}
                    className="w-full p-2 rounded-m border border-borde-control bg-fondo-superficie text-caption"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-weight-medio text-texto-principal mb-1">
                    Lugar o modalidad
                  </label>
                  <input
                    type="text"
                    required
                    placeholder='Ej. "Virtual" o "Edificio A, sala 301"'
                    value={lugar}
                    onChange={(e) => setLugar(e.target.value)}
                    className="w-full p-2.5 rounded-m border border-borde-control bg-fondo-superficie text-caption"
                  />
                </div>

                <div>
                  <label className="block font-weight-medio text-texto-principal mb-1">
                    Enlace virtual (opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://teams.microsoft.com/..."
                    value={enlace}
                    onChange={(e) => setEnlace(e.target.value)}
                    className="w-full p-2.5 rounded-m border border-borde-control bg-fondo-superficie text-caption"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="publicar-check"
                  type="checkbox"
                  checked={publicado}
                  onChange={(e) => setPublicado(e.target.checked)}
                  className="w-4 h-4 rounded-s text-morado-600 border-borde-control"
                />
                <label
                  htmlFor="publicar-check"
                  className="font-weight-medio text-texto-principal cursor-pointer"
                >
                  Publicar en la cartelera web inmediatamente
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-borde-suave">
                <button
                  type="button"
                  onClick={() => {
                    setModalCrear(false);
                    setEventoAEditar(null);
                  }}
                  className="px-4 py-2 rounded-m border border-borde-control hover:bg-fondo-suave cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pendiente}
                  className="px-5 py-2 rounded-m bg-accion-fondo text-accion-texto font-weight-fuerte hover:bg-accion-fondo-activo cursor-pointer disabled:opacity-50"
                >
                  {pendiente ? "Guardando..." : "Guardar evento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
