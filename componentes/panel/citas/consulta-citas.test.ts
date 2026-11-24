import { describe, expect, it } from "vitest";
import { filtrosCitaSchema } from "../../../contratos/filtros-cita";
import {
  consultaBandeja,
  enlaceBandeja,
  enlaceExportacion,
  semanaBogota,
} from "./consulta-citas";

describe("filtros de la bandeja", () => {
  it("exporta los filtros combinados del listado con el día completo de Bogotá y sin paginar", () => {
    const consulta = consultaBandeja({
      fecha: "2026-11-20",
      psicologoId: "psi-1",
      servicioId: "serv-1",
      busqueda: "  Ana Pérez  ",
      pagina: "3",
    });
    expect(consulta.filtros).toEqual({
      estado: "PENDIENTE",
      desde: "2026-11-20T05:00:00.000Z",
      hasta: "2026-11-21T04:59:59.999Z",
      psicologoId: "psi-1",
      servicioId: "serv-1",
      busqueda: "Ana Pérez",
    });
    const exportacion = new URL(
      enlaceExportacion(consulta.filtros),
      "https://ejemplo.test",
    );
    expect(Object.fromEntries(exportacion.searchParams)).toEqual(
      consulta.filtros,
    );
    expect(
      filtrosCitaSchema.parse(Object.fromEntries(exportacion.searchParams)),
    ).toEqual({ ...consulta.filtros, pagina: 1 });
  });

  it("conserva Todas y los filtros al paginar y reinicia la página al cambiar de pestaña", () => {
    const consulta = consultaBandeja({
      fecha: "2026-11-20",
      estado: "todas",
      pagina: "2",
      servicioId: "serv-1",
    });
    expect(consulta.filtros.estado).toBeUndefined();
    expect(enlaceBandeja(consulta, "todas", 3)).toContain(
      "estado=todas&fecha=2026-11-20&servicioId=serv-1&pagina=3",
    );
    expect(enlaceBandeja(consulta, "PENDIENTE")).not.toContain("pagina=");
    expect(
      consultaBandeja({ fecha: "2026-02-30", pagina: "-3", estado: ["todas"] }),
    ).toMatchObject({ fecha: "", pagina: 1, estado: "PENDIENTE" });
  });
});

it("delimita la semana según el día local y cruza el cambio de año", () => {
  const semana = semanaBogota(undefined, new Date("2027-01-04T04:59:59.999Z"));
  expect(semana.dias).toEqual([
    "2026-12-28",
    "2026-12-29",
    "2026-12-30",
    "2026-12-31",
    "2027-01-01",
    "2027-01-02",
    "2027-01-03",
  ]);
  expect(semana).toMatchObject({
    anterior: "2026-12-21",
    siguiente: "2027-01-04",
    desde: "2026-12-28T05:00:00.000Z",
    hasta: "2027-01-04T04:59:59.999Z",
  });
});
