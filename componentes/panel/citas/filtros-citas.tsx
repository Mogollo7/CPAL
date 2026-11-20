"use client";

import { useState } from "react";
import Form from "next/form";
import { Download } from "lucide-react";
import { Boton, BotonEnlace } from "@/componentes/atomos/boton";
import { CLASE_CONTROL } from "@/componentes/moleculas/campo";
import { useConfirmacion } from "@/componentes/panel/confirmar-clave";
import { fallo, ok, SIN_CONEXION, type Resultado } from "@/contratos/resultado";
import {
  enlaceBandeja,
  enlaceExportacion,
  PESTANAS,
  RUTA_CITAS,
  type ConsultaBandeja,
} from "./consulta-citas";

type Opcion = { id: string; nombre: string };

async function prepararCsv(
  url: string,
): Promise<Resultado<{ archivo: Blob; nombre: string }>> {
  const respuesta = await fetch(url, { cache: "no-store" });
  const tipo = respuesta.headers.get("Content-Type");
  if (!respuesta.ok && tipo?.includes("application/json"))
    return respuesta.json();
  if (!respuesta.ok || !tipo?.includes("text/csv")) {
    return fallo(
      "ERROR_INTERNO",
      "No pudimos preparar el archivo CSV. Intenta de nuevo.",
    );
  }
  return ok({
    archivo: await respuesta.blob(),
    nombre:
      respuesta.headers
        .get("Content-Disposition")
        ?.match(/filename="([^"]+)"/)?.[1] ?? "citas.csv",
  });
}

export function FiltrosCitas({
  consulta,
  pendientes,
  profesionales,
  servicios,
}: {
  consulta: ConsultaBandeja;
  pendientes: number;
  profesionales: Opcion[];
  servicios: Opcion[];
}) {
  const { conConfirmacion, dialogo } = useConfirmacion();
  const [preparando, setPreparando] = useState(false);
  const [error, setError] = useState("");

  async function exportar() {
    setPreparando(true);
    setError("");
    try {
      const resultado = await conConfirmacion(() =>
        prepararCsv(enlaceExportacion(consulta.filtros)),
      );
      if (!resultado.ok) {
        setError(resultado.mensaje);
        return;
      }
      const url = URL.createObjectURL(resultado.datos.archivo);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = resultado.datos.nombre;
      document.body.append(enlace);
      enlace.click();
      enlace.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError(SIN_CONEXION);
    } finally {
      setPreparando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-borde-suave pb-3">
        <nav aria-label="Estado de la cita" className="flex flex-wrap gap-2">
          {PESTANAS.map(({ estado, nombre }) => (
            <BotonEnlace
              key={estado}
              href={enlaceBandeja(consulta, estado)}
              tipo={estado === consulta.estado ? "suave" : "borde"}
              aria-current={estado === consulta.estado ? "page" : undefined}
            >
              {nombre}
              {estado === "PENDIENTE" && ` (${pendientes})`}
            </BotonEnlace>
          ))}
        </nav>
        <Boton tipo="borde" onClick={exportar} disabled={preparando}>
          <Download className="size-4" aria-hidden="true" />
          {preparando ? "Preparando…" : "Exportar CSV"}
        </Boton>
      </div>
      {dialogo}
      {error && (
        <p role="alert" className="text-error-texto">
          {error}
        </p>
      )}
      <p className="text-caption text-texto-secundario">
        Aplica los filtros para actualizar la tabla y el archivo CSV.
      </p>
      <Form
        action={RUTA_CITAS}
        key={enlaceBandeja(consulta)}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <input type="hidden" name="estado" value={consulta.estado} />
        <label className="space-y-1 text-caption">
          Buscar citas
          <input
            type="search"
            name="busqueda"
            defaultValue={consulta.busqueda}
            maxLength={80}
            placeholder="Código, nombre, correo o documento"
            className={CLASE_CONTROL}
          />
        </label>
        <label className="space-y-1 text-caption">
          Fecha (hora de Bogotá)
          <input
            type="date"
            name="fecha"
            defaultValue={consulta.fecha}
            className={CLASE_CONTROL}
          />
        </label>
        <FiltroSelect
          nombre="psicologoId"
          etiqueta="Profesional"
          todos="Todos los profesionales"
          valor={consulta.psicologoId}
          opciones={profesionales}
        />
        <FiltroSelect
          nombre="servicioId"
          etiqueta="Servicio"
          todos="Todos los servicios"
          valor={consulta.servicioId}
          opciones={servicios}
        />
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Boton type="submit">Aplicar filtros</Boton>
          <BotonEnlace tipo="borde" href={RUTA_CITAS}>
            Limpiar filtros
          </BotonEnlace>
        </div>
      </Form>
    </div>
  );
}

function FiltroSelect({
  nombre,
  etiqueta,
  todos,
  valor,
  opciones,
}: {
  nombre: string;
  etiqueta: string;
  todos: string;
  valor: string;
  opciones: Opcion[];
}) {
  return (
    <label className="space-y-1 text-caption">
      {etiqueta}
      <select name={nombre} defaultValue={valor} className={CLASE_CONTROL}>
        <option value="">{todos}</option>
        {valor && !opciones.some(({ id }) => id === valor) && (
          <option value={valor}>No se encontró</option>
        )}
        {opciones.map(({ id, nombre }) => (
          <option key={id} value={id}>
            {nombre}
          </option>
        ))}
      </select>
    </label>
  );
}
