import type { FiltrosCita } from "../../../contratos/filtros-cita";
import { desdeBogota, diaSemana, fechaBogota } from "../../../servidor/fechas";

export const RUTA_CITAS = "/panel/admin/citas";
export const PESTANAS = [
  { estado: "PENDIENTE", nombre: "Pendientes" },
  { estado: "AUTORIZADA", nombre: "Autorizadas" },
  { estado: "RECHAZADA", nombre: "Rechazadas" },
  { estado: "todas", nombre: "Todas" },
] as const;

type Parametros = Record<string, string | string[] | undefined>;

export function fechaValida(valor: unknown): valor is string {
  if (typeof valor !== "string" || !/^[1-9]\d{3}-\d{2}-\d{2}$/.test(valor))
    return false;
  const instante = new Date(`${valor}T00:00:00Z`);
  return (
    Number.isFinite(+instante) && instante.toISOString().slice(0, 10) === valor
  );
}

const MINUTOS_DIA = 1440;

export function rangoBogota(fecha: string, dias = 1) {
  return {
    desde: desdeBogota(fecha).toISOString(),
    hasta: new Date(+desdeBogota(fecha, dias * MINUTOS_DIA) - 1).toISOString(),
  };
}

export function semanaBogota(fecha: unknown, ahora = new Date()) {
  const dia = fechaValida(fecha) ? fecha : fechaBogota(ahora);
  const lunes = fechaBogota(
    desdeBogota(dia, (1 - diaSemana(desdeBogota(dia))) * MINUTOS_DIA),
  );
  const desplazar = (dias: number) =>
    fechaBogota(desdeBogota(lunes, dias * MINUTOS_DIA));
  return {
    dias: Array.from({ length: 7 }, (_, indice) => desplazar(indice)),
    anterior: desplazar(-7),
    siguiente: desplazar(7),
    ...rangoBogota(lunes, 7),
  };
}

export function consultaBandeja(params: Parametros) {
  const estado =
    PESTANAS.find((pestana) => pestana.estado === params.estado)?.estado ??
    "PENDIENTE";
  const fecha = fechaValida(params.fecha) ? params.fecha : "";
  const busqueda =
    typeof params.busqueda === "string"
      ? params.busqueda.trim().slice(0, 80).trimEnd()
      : "";
  const psicologoId =
    typeof params.psicologoId === "string" ? params.psicologoId : "";
  const servicioId =
    typeof params.servicioId === "string" ? params.servicioId : "";
  const numero =
    typeof params.pagina === "string" && /^\d+$/.test(params.pagina)
      ? Number(params.pagina)
      : 1;
  const pagina = Number.isSafeInteger(numero) && numero > 0 ? numero : 1;
  const filtros: Omit<FiltrosCita, "pagina"> = {
    ...(estado !== "todas" && { estado }),
    ...(fecha && rangoBogota(fecha)),
    ...(busqueda && { busqueda }),
    ...(psicologoId && { psicologoId }),
    ...(servicioId && { servicioId }),
  };
  return { estado, fecha, busqueda, psicologoId, servicioId, pagina, filtros };
}

export type ConsultaBandeja = ReturnType<typeof consultaBandeja>;

function parametrosConValores(valores: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(valores)) {
    if (valor) params.set(clave, valor);
  }
  return params;
}

export function enlaceBandeja(
  consulta: ConsultaBandeja,
  estado = consulta.estado,
  pagina = 1,
) {
  const { fecha, busqueda, psicologoId, servicioId } = consulta;
  return `${RUTA_CITAS}?${parametrosConValores({ estado, fecha, busqueda, psicologoId, servicioId, pagina: pagina > 1 ? String(pagina) : undefined })}`;
}

export function enlaceExportacion(filtros: ConsultaBandeja["filtros"]) {
  return `/api/admin/exportar?${parametrosConValores(filtros)}`;
}
