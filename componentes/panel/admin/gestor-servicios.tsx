"use client";

import { useState, useTransition, type FormEvent } from "react";
import { ListChecks } from "lucide-react";
import { Boton } from "@/componentes/atomos/boton";
import { Etiqueta } from "@/componentes/atomos/etiqueta";
import { Titulo } from "@/componentes/atomos/titulo";
import { CLASE_CONTROL } from "@/componentes/moleculas/campo";
import type { ServicioGuardado } from "@/contratos/servicio";
import { SIN_CONEXION } from "@/contratos/resultado";
import { guardarServicioAccion } from "@/servidor/acciones";
import { EstadoVacio } from "../estado-vacio";
import { TarjetaPanel } from "../tarjeta-panel";

export function GestorServicios({
  iniciales,
}: {
  iniciales: ServicioGuardado[];
}) {
  const [servicios, setServicios] = useState(iniciales);
  const [edicion, setEdicion] = useState<ServicioGuardado | null>();
  const [error, setError] = useState<string>();
  const [aviso, setAviso] = useState<string>();
  const [guardando, iniciar] = useTransition();

  function abrir(servicio: ServicioGuardado | null) {
    setError(undefined);
    setAviso(undefined);
    setEdicion(servicio);
  }

  function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    setError(undefined);
    iniciar(async () => {
      try {
        const resultado = await guardarServicioAccion({
          id: edicion?.id,
          orden: edicion?.orden,
          nombre: datos.get("nombre"),
          descripcion: datos.get("descripcion"),
          duracionMin: Number(datos.get("duracionMin")),
          area: datos.get("area"),
          activo: datos.has("activo"),
          agendableEnLinea: datos.has("agendableEnLinea"),
        });
        if (!resultado.ok) {
          setError(resultado.mensaje);
          return;
        }
        const servicio = resultado.datos;
        setServicios((prev) =>
          [...prev.filter((item) => item.id !== servicio.id), servicio].sort(
            (a, b) =>
              a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"),
          ),
        );
        setEdicion(undefined);
        setAviso(edicion ? "Cambios guardados." : "Servicio creado.");
      } catch {
        setError(SIN_CONEXION);
      }
    });
  }

  return (
    <div className="space-y-4">
      {aviso && (
        <p role="status" className="text-exito-texto">
          {aviso}
        </p>
      )}
      <Boton onClick={() => abrir(null)} disabled={edicion !== undefined}>
        Crear servicio
      </Boton>
      {edicion !== undefined && (
        <TarjetaPanel>
          <Titulo tamano="tarjeta" id="titulo-servicio">
            {edicion ? `Editar ${edicion.nombre}` : "Nuevo servicio"}
          </Titulo>
          <form
            aria-labelledby="titulo-servicio"
            onSubmit={guardar}
            className="mt-4 space-y-4"
          >
            <fieldset
              disabled={guardando}
              className="grid gap-4 sm:grid-cols-2"
            >
              <label className="space-y-1">
                Nombre{" "}
                <input
                  autoFocus
                  className={CLASE_CONTROL}
                  name="nombre"
                  defaultValue={edicion?.nombre}
                  required
                  minLength={3}
                  maxLength={80}
                />
              </label>
              <label className="space-y-1">
                Duración en minutos{" "}
                <input
                  className={CLASE_CONTROL}
                  name="duracionMin"
                  type="number"
                  defaultValue={edicion?.duracionMin ?? 60}
                  required
                  min={15}
                  max={240}
                />
              </label>
              <label className="space-y-1 sm:col-span-2">
                Descripción{" "}
                <textarea
                  className={`${CLASE_CONTROL} py-2`}
                  name="descripcion"
                  rows={3}
                  defaultValue={edicion?.descripcion}
                  required
                  maxLength={600}
                />
              </label>
              <label className="space-y-1">
                Área{" "}
                <select
                  className={CLASE_CONTROL}
                  name="area"
                  defaultValue={edicion?.area ?? "PSICOLOGIA"}
                >
                  <option value="PSICOLOGIA">Psicología</option>
                  <option value="NEUROPSICOLOGIA">Neuropsicología</option>
                </select>
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="activo"
                    defaultChecked={edicion?.activo ?? true}
                    className="focus-visible:outline-2 focus-visible:outline-foco"
                  />{" "}
                  Activo
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="agendableEnLinea"
                    defaultChecked={edicion?.agendableEnLinea ?? false}
                    className="focus-visible:outline-2 focus-visible:outline-foco"
                  />{" "}
                  Agendable en línea
                </label>
              </div>
            </fieldset>
            {error && (
              <p role="alert" className="text-error-texto">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Boton
                tipo="borde"
                disabled={guardando}
                onClick={() => setEdicion(undefined)}
              >
                Cancelar
              </Boton>
              <Boton type="submit" disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar servicio"}
              </Boton>
            </div>
          </form>
        </TarjetaPanel>
      )}
      {servicios.length === 0 ? (
        <EstadoVacio
          icono={ListChecks}
          titulo="Aún no hay servicios"
          descripcion="Crea el primer servicio para empezar a armar el catálogo."
        />
      ) : (
        <ul className="space-y-3">
          {servicios.map((servicio) => (
            <li key={servicio.id}>
              <TarjetaPanel className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 space-y-2 wrap-break-word">
                  <Titulo tamano="tarjeta">{servicio.nombre}</Titulo>
                  <p className="text-texto-secundario">
                    {servicio.descripcion}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Etiqueta>{servicio.duracionMin} min</Etiqueta>
                    <Etiqueta>
                      {servicio.activo ? "Activo" : "Inactivo"}
                    </Etiqueta>
                    <Etiqueta>
                      {servicio.agendableEnLinea
                        ? "Agendable en línea"
                        : "Sin agenda en línea"}
                    </Etiqueta>
                  </div>
                </div>
                <Boton
                  tipo="borde"
                  disabled={edicion !== undefined}
                  aria-label={`Editar ${servicio.nombre}`}
                  onClick={() => abrir(servicio)}
                >
                  Editar
                </Boton>
              </TarjetaPanel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
