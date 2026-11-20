"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { CLASE_CONTROL } from "@/componentes/moleculas/campo";
import { cn } from "@/componentes/cn";
import { EsqueletoCalmo } from "@/componentes/atomos/esqueleto-calmo";
import { Boton } from "@/componentes/atomos/boton";
import type { Cupo, PsicologoDeServicio } from "@/contratos/cupo";
import { SIN_CONEXION } from "@/contratos/resultado";
import {
  listarPsicologosDeServicioAccion,
  obtenerCuposAccion,
} from "@/servidor/acciones";
import { ZONA, fechaBogota, formatoHora } from "@/servidor/fechas";

const VENTANA_MS = 14 * 86_400_000;

const etiquetaDia = new Intl.DateTimeFormat("es-CO", {
  timeZone: ZONA,
  weekday: "short",
  day: "numeric",
  month: "short",
});

export type CambioCupo = {
  psicologoId?: string;
  psicologoNombre?: string;
  inicio: string;
};

/** Elegir profesional y un cupo libre real (RF-CIT-03). Lo usan /pedir-cita (paso 3) y reprogramar en /cita/[token].
 *  `recargar`: cambiarlo vuelve a pedir los cupos (p. ej. tras «ese horario ya fue tomado»). */
export function SelectorCupo({ recargar = "", ...props }: SelectorCupoProps) {
  return (
    <>
      <FiltroProfesional key={props.servicioId} {...props} />
      <AgendaCupos
        key={JSON.stringify([props.servicioId, props.psicologoId, recargar])}
        {...props}
      />
    </>
  );
}

type SelectorCupoProps = {
  servicioId: string;
  psicologoId: string;
  inicio: string;
  recargar?: string;
  alCambiar: (c: CambioCupo) => void;
};

function FiltroProfesional({
  servicioId,
  psicologoId,
  alCambiar,
}: Pick<SelectorCupoProps, "servicioId" | "psicologoId" | "alCambiar">) {
  const id = useId();
  const [psicologos, setPsicologos] = useState<PsicologoDeServicio[]>([]);
  const [errorProfesionales, setErrorProfesionales] = useState("");

  useEffect(() => {
    let vigente = true;
    listarPsicologosDeServicioAccion(servicioId)
      .then((r) => {
        if (!vigente) return;
        if (r.ok) setPsicologos(r.datos);
        else setErrorProfesionales(r.mensaje);
      })
      .catch(() => {
        if (vigente) setErrorProfesionales(SIN_CONEXION);
      });
    return () => {
      vigente = false;
    };
  }, [servicioId]);

  return (
    <div className="space-y-3">
      <label
        htmlFor={id}
        className="block text-p font-fuerte text-texto-titulo"
      >
        Profesional de tu preferencia
      </label>
      <select
        id={id}
        value={psicologoId}
        onChange={(evento) =>
          alCambiar({
            psicologoId: evento.target.value,
            psicologoNombre: evento.target.selectedOptions[0].text,
            inicio: "",
          })
        }
        className={cn(CLASE_CONTROL, "font-medio")}
      >
        <option value="">Cualquier profesional disponible</option>
        {psicologoId &&
          !psicologos.some((profesional) => profesional.id === psicologoId) && (
            <option value={psicologoId}>Profesional seleccionado</option>
          )}
        {psicologos.map((profesional) => (
          <option key={profesional.id} value={profesional.id}>
            {profesional.nombre}
          </option>
        ))}
      </select>
      {errorProfesionales && (
        <p role="alert" className="text-caption text-error-texto">
          {errorProfesionales}
        </p>
      )}
    </div>
  );
}

function AgendaCupos({
  servicioId,
  psicologoId,
  inicio,
  alCambiar,
}: Omit<SelectorCupoProps, "recargar">) {
  const [consulta, setConsulta] = useState({ desde: "" });
  const [cupos, setCupos] = useState<Cupo[]>([]);
  const [respuesta, setRespuesta] = useState<{
    consulta: typeof consulta;
    error?: string;
    vacia?: boolean;
    cursor?: string | null;
    siguiente?: string | null;
  } | null>(null);
  const cargando = respuesta?.consulta !== consulta;
  const [diaElegido, setDiaElegido] = useState("");

  useEffect(() => {
    let vigente = true;
    const desde = consulta.desde ? new Date(consulta.desde) : new Date();
    obtenerCuposAccion({
      modo: "agenda",
      servicioId,
      psicologoId: psicologoId || undefined,
      desde: desde.toISOString(),
      hasta: new Date(desde.getTime() + VENTANA_MS).toISOString(),
    })
      .then((r) => {
        if (!vigente) return;
        if (!r.ok) return setRespuesta({ consulta, error: r.mensaje });
        const pagina = Array.isArray(r.datos)
          ? { cupos: r.datos, cursor: null, siguiente: null }
          : r.datos;
        setCupos((anteriores) => {
          const porInicio = new Map(
            anteriores.map((cupo) => [cupo.inicio, cupo]),
          );
          for (const cupo of pagina.cupos) porInicio.set(cupo.inicio, cupo);
          return [...porInicio.values()].sort((primero, segundo) =>
            primero.inicio.localeCompare(segundo.inicio),
          );
        });
        setRespuesta({
          consulta,
          vacia: pagina.cupos.length === 0,
          cursor: pagina.cursor,
          siguiente: pagina.siguiente,
        });
      })
      .catch(() => {
        if (vigente) setRespuesta({ consulta, error: SIN_CONEXION });
      });
    return () => {
      vigente = false;
    };
  }, [consulta, servicioId, psicologoId]);

  const porDia = useMemo(() => {
    const dias = new Map<string, Cupo[]>();
    for (const cupo of cupos) {
      const dia = fechaBogota(new Date(cupo.inicio));
      dias.set(dia, [...(dias.get(dia) ?? []), cupo]);
    }
    return dias;
  }, [cupos]);

  const diaDelCupo = inicio ? fechaBogota(new Date(inicio)) : "";
  const dia =
    (porDia.has(diaDelCupo) ? diaDelCupo : "") ||
    (porDia.has(diaElegido) ? diaElegido : [...porDia.keys()][0]);

  return (
    <div className="space-y-4 pt-2 border-t border-morado-50">
      <span className="block text-p font-fuerte text-texto-titulo">
        Fecha y hora
      </span>

      {cargando && !cupos.length && (
        <div aria-busy="true" aria-label="Buscando horarios libres">
          <EsqueletoCalmo className="h-[128px] w-full rounded-m" />
        </div>
      )}

      {!cargando && respuesta?.error && (
        <p
          role="alert"
          className="p-4 rounded-m bg-error-fondo text-error-texto text-caption"
        >
          {respuesta.error}
        </p>
      )}

      {!cargando && respuesta?.vacia && (
        <p
          role="status"
          className="rounded-m bg-crema border border-borde-suave p-5 text-p"
        >
          {respuesta.siguiente
            ? "No hay horarios libres en estos días."
            : "No hay más horarios libres dentro del plazo de la agenda."}{" "}
          {!respuesta.siguiente && (
            <>
              Puedes elegir otro profesional o{" "}
              <Link href="/contacto" className="text-texto-enlace underline">
                escríbenos
              </Link>{" "}
              y te ayudamos.
            </>
          )}
        </p>
      )}

      {porDia.size > 0 && (
        <>
          <div
            role="group"
            aria-label="Días con horarios libres"
            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
          >
            {[...porDia.keys()].map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={d === dia}
                onClick={() => {
                  setDiaElegido(d);
                  alCambiar({ inicio: "" });
                }}
                className={cn(
                  "min-h-[48px] p-3 rounded-m border text-center transition-colors capitalize",
                  "focus-visible:outline-3 focus-visible:outline-foco",
                  d === dia
                    ? "bg-accion-fondo text-accion-texto font-medio border-accion-fondo shadow-xs"
                    : "bg-fondo-superficie border-borde-suave text-texto-principal hover:bg-morado-50",
                )}
              >
                {etiquetaDia.format(new Date(porDia.get(d)![0].inicio))}
              </button>
            ))}
          </div>

          <div
            role="group"
            aria-label="Horas libres del día"
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {porDia.get(dia)?.map((c) => (
              <button
                key={c.inicio}
                type="button"
                aria-pressed={inicio === c.inicio}
                onClick={() => alCambiar({ inicio: c.inicio })}
                className={cn(
                  "min-h-[48px] px-4 py-2 rounded-m border text-center font-medio text-p transition-colors flex items-center justify-center gap-2",
                  "focus-visible:outline-3 focus-visible:outline-foco",
                  inicio === c.inicio
                    ? "bg-morado-900 text-blanco border-morado-900 shadow-xs"
                    : "bg-blanco border-borde text-texto-principal hover:bg-morado-50",
                )}
              >
                <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{formatoHora(new Date(c.inicio))}</span>
              </button>
            ))}
          </div>
        </>
      )}
      <div className="flex flex-wrap gap-3" aria-busy={cargando}>
        {respuesta?.siguiente && (
          <Boton
            tipo="suave"
            disabled={cargando}
            onClick={() => {
              const siguiente = respuesta.siguiente!;
              setDiaElegido(fechaBogota(new Date(siguiente)));
              alCambiar({ inicio: "" });
              setConsulta({ desde: siguiente });
            }}
          >
            Ver cupos del {etiquetaDia.format(new Date(respuesta.siguiente))}
          </Boton>
        )}
        {respuesta?.cursor && (
          <Boton
            tipo="borde"
            disabled={cargando}
            onClick={() => setConsulta({ desde: respuesta.cursor! })}
          >
            {cargando ? "Buscando horarios…" : "Ver más días"}
          </Boton>
        )}
        {!cargando && respuesta?.error && (
          <Boton tipo="borde" onClick={() => setConsulta({ ...consulta })}>
            Volver a intentar
          </Boton>
        )}
      </div>
    </div>
  );
}
