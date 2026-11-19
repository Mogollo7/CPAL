"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { CLASE_CONTROL } from "@/componentes/ui/campo";
import { cn } from "@/componentes/ui/cn";
import { EsqueletoCalmo } from "@/componentes/ui/esqueleto-calmo";
import type { Cupo, PsicologoDeServicio } from "@/contratos/cupo";
import { SIN_CONEXION } from "@/contratos/resultado";
import {
  listarPsicologosDeServicioAccion,
  obtenerCuposAccion,
} from "@/servidor/acciones";
import { ZONA, fechaBogota, formatoHora } from "@/servidor/fechas";

// ponytail: solo los próximos 14 días (máximo de /api/cupos); paginar semanas si el CAPL abre agenda a 30 días.
const VENTANA_MS = 14 * 86_400_000;

const etiquetaDia = new Intl.DateTimeFormat("es-CO", {
  timeZone: ZONA,
  weekday: "short",
  day: "numeric",
  month: "short",
});

type Estado =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "listo"; cupos: Cupo[] };

export type CambioCupo = {
  psicologoId?: string;
  psicologoNombre?: string;
  inicio: string;
};

/** Elegir profesional y un cupo libre real (RF-CIT-03). Lo usan /pedir-cita (paso 3) y reprogramar en /cita/[token].
 *  `recargar`: cambiarlo vuelve a pedir los cupos (p. ej. tras «ese horario ya fue tomado»). */
export function SelectorCupo({
  servicioId,
  psicologoId,
  inicio,
  recargar = "",
  alCambiar,
}: {
  servicioId: string;
  psicologoId: string;
  inicio: string;
  recargar?: string;
  alCambiar: (c: CambioCupo) => void;
}) {
  const [psicologos, setPsicologos] = useState<PsicologoDeServicio[]>([]);
  // La respuesta se guarda con la consulta que la pidió: si la consulta cambió, se está cargando.
  const clave = `${servicioId}|${psicologoId}|${recargar}`;
  const [respuesta, setRespuesta] = useState<{
    clave: string;
    estado: Estado;
  } | null>(null);
  const estado: Estado = useMemo(
    () =>
      respuesta?.clave === clave ? respuesta.estado : { tipo: "cargando" },
    [respuesta, clave],
  );

  useEffect(() => {
    listarPsicologosDeServicioAccion(servicioId)
      .then((r) => setPsicologos(r.ok ? r.datos : []))
      .catch(() => setPsicologos([]));
  }, [servicioId]);

  useEffect(() => {
    const desde = new Date();
    obtenerCuposAccion({
      servicioId,
      psicologoId: psicologoId || undefined,
      desde: desde.toISOString(),
      hasta: new Date(desde.getTime() + VENTANA_MS).toISOString(),
    })
      .then((r): Estado =>
        r.ok
          ? { tipo: "listo", cupos: r.datos }
          : { tipo: "error", mensaje: r.mensaje },
      )
      .catch((): Estado => ({ tipo: "error", mensaje: SIN_CONEXION }))
      .then((e) => setRespuesta({ clave, estado: e }));
  }, [clave, servicioId, psicologoId]);

  const porDia = useMemo(() => {
    const dias = new Map<string, Cupo[]>();
    if (estado.tipo === "listo")
      for (const c of estado.cupos) {
        const dia = fechaBogota(new Date(c.inicio));
        dias.set(dia, [...(dias.get(dia) ?? []), c]);
      }
    return dias;
  }, [estado]);

  const [diaElegido, setDiaElegido] = useState("");
  const dia =
    (inicio && fechaBogota(new Date(inicio))) ||
    (porDia.has(diaElegido) ? diaElegido : [...porDia.keys()][0]);

  return (
    <>
      <div className="space-y-3">
        <label
          htmlFor="selector-psicologo"
          className="block text-p font-fuerte text-texto-titulo"
        >
          Profesional de tu preferencia
        </label>
        <select
          id="selector-psicologo"
          value={psicologoId}
          onChange={(e) =>
            alCambiar({
              psicologoId: e.target.value,
              psicologoNombre: e.target.selectedOptions[0].text,
              inicio: "",
            })
          }
          className={cn(CLASE_CONTROL, "font-medio")}
        >
          <option value="">Cualquier profesional disponible</option>
          {psicologos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4 pt-2 border-t border-morado-50">
        <span className="block text-p font-fuerte text-texto-titulo">
          Fecha y hora
        </span>

        {estado.tipo === "cargando" && (
          <div aria-busy="true" aria-label="Buscando horarios libres">
            <EsqueletoCalmo className="h-32 w-full rounded-m" />
          </div>
        )}

        {estado.tipo === "error" && (
          <p
            role="alert"
            className="p-4 rounded-m bg-error-fondo text-error-texto text-caption"
          >
            {estado.mensaje}
          </p>
        )}

        {estado.tipo === "listo" && porDia.size === 0 && (
          <p className="rounded-m bg-crema border border-borde-suave p-5 text-p">
            No hay horarios libres en las próximas dos semanas
            {psicologoId ? " con este profesional" : ""}. Prueba con otro
            profesional o{" "}
            <Link href="/contacto" className="text-texto-enlace underline">
              escríbenos
            </Link>{" "}
            y te ayudamos.
          </p>
        )}

        {porDia.size > 0 && (
          <>
            <div
              role="radiogroup"
              aria-label="Días con horarios libres"
              className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            >
              {[...porDia.keys()].map((d) => (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={d === dia}
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
              role="radiogroup"
              aria-label="Horas libres del día"
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              {porDia.get(dia)?.map((c) => (
                <button
                  key={c.inicio}
                  type="button"
                  role="radio"
                  aria-checked={inicio === c.inicio}
                  onClick={() => alCambiar({ inicio: c.inicio })}
                  className={cn(
                    "min-h-[48px] px-4 py-2.5 rounded-m border text-center font-medio text-p transition-colors flex items-center justify-center gap-2",
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
      </div>
    </>
  );
}
