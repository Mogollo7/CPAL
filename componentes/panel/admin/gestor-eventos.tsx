"use client";
import { SIN_CONEXION } from "@/contratos/resultado";

import {
  useState,
  useTransition,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { Plus, CheckCircle2, AlertCircle, X } from "lucide-react";
import {
  type EventoDetalle,
  type TipoEvento,
  TIPOS_EVENTO,
  ROTULO_TIPO,
} from "@/contratos/evento";
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
  const [tipo, setTipo] = useState<TipoEvento>("TALLER");
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
    setTipo("TALLER");
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
    setTipo(ev.tipo ?? "TALLER");
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
      tipo,
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
        setMensaje({ tipo: "error", texto: SIN_CONEXION });
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
        setMensaje({ tipo: "error", texto: SIN_CONEXION });
      }
    });
  };

  const accionesEvento = (ev: EventoDetalle) => (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => abrirEdicion(ev)}
        className="min-h-[44px] rounded-s border border-borde-suave px-3 text-p font-medio text-texto-enlace hover:bg-fondo-suave"
      >
        Editar
      </button>
      <label className="relative inline-flex min-h-[44px] cursor-pointer items-center rounded-s border border-borde-suave px-3 text-p font-medio text-texto-enlace hover:bg-fondo-suave focus-within:outline-2 focus-within:outline-foco">
        {ev.imagenUrl ? "Cambiar afiche" : "Subir afiche"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => manejarSubirImagen(ev.id, e)}
          className="sr-only"
        />
      </label>
    </div>
  );

  return (
    <div className="space-y-6 w-full">
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

      {/* Botón Superior */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={abrirCreacion}
          className="inline-flex items-center gap-2 px-5 py-[10px] rounded-m bg-accion-fondo text-accion-texto text-caption font-fuerte hover:bg-accion-fondo-activo transition-all  cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo evento</span>
        </button>
      </div>

      <div className="@container min-w-0 rounded-m border border-borde-suave bg-fondo-superficie p-4 sm:p-5">
        <h2 className="font-titulo font-fuerte text-subtitulo text-texto-titulo">
          Cartelera del centro
        </h2>
        <p className="text-texto-secundario mb-5">
          Selecciona un evento para revisar la publicación.
        </p>
        <ul
          aria-label="Eventos del centro"
          className="reticula-capl @min-[45rem]:hidden"
        >
          {eventos.map((ev) => (
            <li
              key={ev.id}
              className="col-span-4 min-w-0 space-y-3 rounded-m border border-borde-suave p-4 wrap-anywhere @min-[34rem]:col-span-2"
            >
              <h3 className="text-h2 font-fuerte">{ev.titulo}</h3>
              <p>{ev.descripcion}</p>
              <p className="text-texto-secundario">
                {formatearFechaBogota(ev.inicio)} · {ev.lugar}
              </p>
              <p className="font-medio">
                {ev.publicado ? "Publicado" : "Borrador"}
              </p>
              {ev.enlace && (
                <a
                  href={ev.enlace}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[44px] items-center text-texto-enlace underline"
                >
                  Abrir enlace del evento
                </a>
              )}
              {accionesEvento(ev)}
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto @min-[45rem]:block">
          <table className="w-full min-w-[700px] text-left text-caption">
            <thead className="bg-fondo-suave text-texto-secundario">
              <tr>
                <th className="p-3">Evento</th>
                <th className="p-3">Fecha y hora</th>
                <th className="p-3">Lugar</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde-suave">
              {eventos.map((ev) => (
                <tr key={ev.id}>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => abrirEdicion(ev)}
                      className="font-fuerte hover:underline text-left"
                    >
                      {ev.titulo}
                    </button>
                    <span className="block text-texto-secundario">
                      {ev.descripcion}
                    </span>
                    {ev.enlace && (
                      <a
                        href={ev.enlace}
                        target="_blank"
                        className="text-texto-enlace hover:underline"
                      >
                        {ev.enlace}
                      </a>
                    )}
                  </td>
                  <td className="p-3 text-texto-secundario">
                    {formatearFechaBogota(ev.inicio)}
                  </td>
                  <td className="p-3 text-texto-secundario">{ev.lugar}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex rounded-pildora px-3 py-1 font-medio ${ev.publicado ? "bg-exito-fondo text-exito-texto" : "bg-aviso-fondo text-amarillo-700"}`}
                    >
                      {ev.publicado ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="p-3">{accionesEvento(ev)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR / EDITAR EVENTO */}
      {(modalCrear || eventoAEditar) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-morado-900/40 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-m border border-borde-suave bg-fondo-superficie p-4 shadow-flotante sm:p-6">
            <button
              type="button"
              onClick={() => {
                setModalCrear(false);
                setEventoAEditar(null);
              }}
              aria-label="Cerrar formulario de evento"
              className="absolute top-2 right-2 grid size-[44px] place-items-center rounded-s text-texto-secundario hover:bg-fondo-suave"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="mb-4 pr-[3rem] text-h2 font-fuerte text-texto-titulo">
              {eventoAEditar ? "Editar Evento" : "Crear Nuevo Evento"}
            </h3>

            <form onSubmit={manejarGuardar} className="space-y-4 text-caption">
              <div>
                <label className="block font-medio text-texto-principal mb-1">
                  Título del evento (máx. 120 caracteres)
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Taller de primeros auxilios psicológicos"
                  className="w-full p-[10px] rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
                />
              </div>

              <div>
                <label className="block font-medio text-texto-principal mb-1">
                  Descripción del taller o charla
                </label>
                <textarea
                  rows={3}
                  required
                  maxLength={2000}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe los temas, objetivos y a quién va dirigido..."
                  className="w-full p-[10px] rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600 resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="tipo"
                  className="block font-medio text-texto-principal mb-1"
                >
                  Tipo
                </label>
                <select
                  id="tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoEvento)}
                  className="w-full p-[10px] rounded-m border border-borde-control bg-fondo-superficie text-caption focus-visible:outline-morado-600"
                >
                  {TIPOS_EVENTO.map((t) => (
                    <option key={t} value={t}>
                      {ROTULO_TIPO[t]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medio text-texto-principal mb-1">
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
                  <label className="block font-medio text-texto-principal mb-1">
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
                  <label className="block font-medio text-texto-principal mb-1">
                    Lugar o modalidad
                  </label>
                  <input
                    type="text"
                    required
                    placeholder='Ej. "Virtual" o "Edificio A, sala 301"'
                    value={lugar}
                    onChange={(e) => setLugar(e.target.value)}
                    className="w-full p-[10px] rounded-m border border-borde-control bg-fondo-superficie text-caption"
                  />
                </div>

                <div>
                  <label className="block font-medio text-texto-principal mb-1">
                    Enlace virtual (opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://teams.microsoft.com/..."
                    value={enlace}
                    onChange={(e) => setEnlace(e.target.value)}
                    className="w-full p-[10px] rounded-m border border-borde-control bg-fondo-superficie text-caption"
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
                  className="font-medio text-texto-principal cursor-pointer"
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
                  className="px-5 py-2 rounded-m bg-accion-fondo text-accion-texto font-fuerte hover:bg-accion-fondo-activo cursor-pointer disabled:opacity-50"
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
