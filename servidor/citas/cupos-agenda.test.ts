import { beforeEach, describe, expect, it, vi } from "vitest";
import { obtenerCupos } from "./cupos";
import { cuposDeServicio } from "./datos";

vi.mock("../bd", () => ({ bd: {} }));
vi.mock("../limites", () => ({ limitar: () => ({ permitido: true }) }));
vi.mock("./datos", () => ({ cuposDeServicio: vi.fn() }));

const ahora = new Date("2026-11-20T14:00:00.000Z");
const contexto = { ahora, ip: "127.0.0.1" };
const entrada = {
  modo: "agenda" as const,
  servicioId: "servicio",
  psicologoId: "profesional",
  desde: ahora.toISOString(),
  hasta: "2026-12-04T14:00:00.000Z",
};
const cupo = {
  inicio: "2026-12-09T14:00:00.000Z",
  fin: "2026-12-09T15:00:00.000Z",
  psicologoIds: ["profesional"],
};

function datos(anticipacionMaxDias: number, cupos: (typeof cupo)[] = []) {
  return {
    servicio: { id: "servicio", nombre: "Servicio", duracionMin: 60 },
    config: {
      anticipacionMaxDias,
      anticipacionMinHoras: 72,
      autoAutorizar: false,
      cancelacionMinHoras: 12,
      maxCitasActivas: 1,
      maxReprogramaciones: 2,
      vencimientoPendienteHoras: 48,
      correoAdministracion: "",
      versionPolitica: "1",
    },
    cupos,
  };
}

describe("ventanas de cupos públicos", () => {
  beforeEach(() => vi.resetAllMocks());

  it("encuentra el primer cupo después de los 14 días sin cambiar el filtro de profesional", async () => {
    vi.mocked(cuposDeServicio)
      .mockResolvedValueOnce(datos(30))
      .mockResolvedValueOnce(datos(30, [cupo]));
    expect(await obtenerCupos(entrada, contexto)).toEqual({
      ok: true,
      datos: { cupos: [], cursor: entrada.hasta, siguiente: cupo.inicio },
    });
    expect(cuposDeServicio).toHaveBeenNthCalledWith(
      2,
      "servicio",
      new Date(entrada.hasta),
      new Date("2026-12-20T14:00:00.001Z"),
      ahora,
      { psicologoId: "profesional" },
    );
  });

  it("no busca más allá de una agenda que ya termina en la primera ventana", async () => {
    vi.mocked(cuposDeServicio).mockResolvedValueOnce(datos(7));
    expect(await obtenerCupos(entrada, contexto)).toEqual({
      ok: true,
      datos: { cupos: [], cursor: null, siguiente: null },
    });
    expect(cuposDeServicio).toHaveBeenCalledTimes(1);
  });

  it("conserva la respuesta de lista para la API existente", async () => {
    const { servicioId, psicologoId, desde, hasta } = entrada;
    vi.mocked(cuposDeServicio).mockResolvedValueOnce(datos(30));
    expect(
      await obtenerCupos({ servicioId, psicologoId, desde, hasta }, contexto),
    ).toEqual({
      ok: true,
      datos: [],
    });
    expect(cuposDeServicio).toHaveBeenCalledTimes(1);
  });
});
