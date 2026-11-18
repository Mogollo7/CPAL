import { describe, expect, it } from "vitest";
import { desdeBogota } from "../fechas";
import {
  calcularCupos,
  type DatosCupos,
  type PsicologoCupos,
} from "./calcularCupos";

const SERVICIO = { id: "s1", duracionMin: 60 };
const MARTES = "2026-11-24"; // martes (diaSemana 2)
const bog = (fecha: string, min: number) => desdeBogota(fecha, min);
const AHORA = bog("2026-11-16", 12 * 60); // lunes 12:00 en Bogotá

const psi = (
  id: string,
  bloques: [number, number][],
  extra: Partial<PsicologoCupos> = {},
): PsicologoCupos => ({
  id,
  activo: true,
  servicioIds: ["s1"],
  disponibilidad: bloques.map(([inicioMin, finMin]) => ({
    diaSemana: 2,
    inicioMin,
    finMin,
  })),
  ...extra,
});
const datos = (extra: Partial<DatosCupos> = {}): DatosCupos => ({
  bloqueos: [],
  citas: [],
  esFestivo: () => false,
  anticipacionMinHoras: 24,
  anticipacionMaxDias: 30,
  ...extra,
});
// Horas de inicio en Bogotá (en minutos) de los cupos que caen en MARTES.
const horas = (c: ReturnType<typeof calcularCupos>) =>
  c.map((x) => (Date.parse(x.inicio) - bog(MARTES, 0).getTime()) / 60_000 / 60);
const dia = (
  ps: PsicologoCupos[],
  d: DatosCupos,
  ahora = AHORA,
  servicio = SERVICIO,
) =>
  calcularCupos(servicio, ps, bog(MARTES, 0), bog("2026-11-25", 0), ahora, d);

describe("calcularCupos (E03 §2)", () => {
  it("parte el bloque en tramos; el que no cabe completo se descarta", () => {
    expect(horas(dia([psi("a", [[480, 630]])], datos()))).toEqual([8, 9]); // 8:00–10:30: el de las 10 no cabe
  });
  it("no ofrece nada en festivo", () => {
    expect(
      dia([psi("a", [[480, 720]])], datos({ esFestivo: (f) => f === MARTES })),
    ).toEqual([]);
  });
  it("un bloqueo parcial quita solo los tramos que cruza", () => {
    const bloqueo = {
      psicologoId: "a",
      desde: bog(MARTES, 570),
      hasta: bog(MARTES, 630),
    }; // 9:30–10:30
    expect(
      horas(dia([psi("a", [[480, 720]])], datos({ bloqueos: [bloqueo] }))),
    ).toEqual([8, 11]);
  });
  it("un bloqueo que solo toca el borde no cruza", () => {
    const bloqueo = {
      psicologoId: "a",
      desde: bog(MARTES, 540),
      hasta: bog(MARTES, 600),
    }; // 9:00–10:00 exacto
    expect(
      horas(dia([psi("a", [[480, 720]])], datos({ bloqueos: [bloqueo] }))),
    ).toEqual([8, 10, 11]);
  });
  it("un bloqueo de todo el centro quita a todos; el de otro psicólogo no afecta", () => {
    const centro = {
      psicologoId: null,
      desde: bog(MARTES, 0),
      hasta: bog("2026-11-25", 0),
    };
    expect(
      dia(
        [psi("a", [[480, 720]]), psi("b", [[480, 720]])],
        datos({ bloqueos: [centro] }),
      ),
    ).toEqual([]);
    const deB = {
      psicologoId: "b",
      desde: bog(MARTES, 0),
      hasta: bog("2026-11-25", 0),
    };
    expect(
      dia(
        [psi("a", [[480, 540]]), psi("b", [[480, 540]])],
        datos({ bloqueos: [deB] }),
      )[0].psicologoIds,
    ).toEqual(["a"]);
  });
  it("una cita pendiente o autorizada ocupa el cupo; una cancelada lo libera", () => {
    const cita = (estado: string) => ({
      psicologoId: "a",
      inicio: bog(MARTES, 540),
      fin: bog(MARTES, 600),
      estado,
    });
    const ps = [psi("a", [[480, 720]])];
    expect(horas(dia(ps, datos({ citas: [cita("PENDIENTE")] })))).toEqual([
      8, 10, 11,
    ]);
    expect(horas(dia(ps, datos({ citas: [cita("AUTORIZADA")] })))).toEqual([
      8, 10, 11,
    ]);
    expect(horas(dia(ps, datos({ citas: [cita("CANCELADA")] })))).toEqual([
      8, 9, 10, 11,
    ]);
    expect(horas(dia(ps, datos({ citas: [cita("VENCIDA")] })))).toEqual([
      8, 9, 10, 11,
    ]);
  });
  it("la cita que se reprograma no ocupa su propio cupo", () => {
    const c = {
      id: "x",
      psicologoId: "a",
      inicio: bog(MARTES, 540),
      fin: bog(MARTES, 600),
      estado: "PENDIENTE",
    };
    expect(
      horas(
        dia(
          [psi("a", [[480, 600]])],
          datos({ citas: [c], excluirCitaId: "x" }),
        ),
      ),
    ).toEqual([8, 9]);
  });
  it("borde de anticipación mínima: justo a 24 h entra; un minuto antes, no", () => {
    const ps = [psi("a", [[480, 600]])]; // 8:00 y 9:00
    const ahora = new Date(bog(MARTES, 480).getTime() - 24 * 3_600_000);
    expect(horas(dia(ps, datos(), ahora))).toEqual([8, 9]);
    expect(horas(dia(ps, datos(), new Date(ahora.getTime() + 60_000)))).toEqual(
      [9],
    );
  });
  it("borde de anticipación máxima: justo a 30 días entra; un minuto después, no", () => {
    const ps = [psi("a", [[480, 600]])];
    const ahora = new Date(bog(MARTES, 540).getTime() - 30 * 86_400_000); // el de las 9:00 está a exactamente 30 días
    expect(horas(dia(ps, datos(), ahora))).toEqual([8, 9]);
    expect(horas(dia(ps, datos(), new Date(ahora.getTime() - 60_000)))).toEqual(
      [8],
    ); // el de las 9 queda a 30 d + 1 min
  });
  it("excluye psicólogo inactivo, sin disponibilidad y el que no atiende el servicio", () => {
    expect(
      dia(
        [
          psi("inactivo", [[480, 540]], { activo: false }),
          psi("sinHorario", []),
          psi("otroServicio", [[480, 540]], { servicioIds: ["s2"] }),
        ],
        datos(),
      ),
    ).toEqual([]);
  });
  it("dos psicólogos en el mismo tramo se agrupan; pedir uno concreto trae solo ese", () => {
    const ps = [psi("a", [[480, 540]]), psi("b", [[480, 540]])];
    const todos = dia(ps, datos());
    expect(todos).toHaveLength(1);
    expect(todos[0].psicologoIds.sort()).toEqual(["a", "b"]);
    expect(dia(ps, datos({ psicologoId: "b" }))[0].psicologoIds).toEqual(["b"]);
  });
  it("respeta la duración del servicio", () => {
    expect(
      horas(
        dia([psi("a", [[480, 600]])], datos(), AHORA, {
          id: "s1",
          duracionMin: 30,
        }),
      ),
    ).toEqual([8, 8.5, 9, 9.5]);
  });
  it("zona horaria: las 7 p. m. de Bogotá son el día siguiente en UTC pero cuentan como martes", () => {
    const cupos = dia([psi("a", [[1140, 1200]])], datos()); // martes 19:00–20:00 Bogotá
    expect(cupos).toHaveLength(1);
    expect(cupos[0].inicio).toBe("2026-11-25T00:00:00.000Z");
    // y un bloque de miércoles no aparece en la ventana del martes
    const miercoles = psi("a", [], {
      disponibilidad: [{ diaSemana: 3, inicioMin: 1140, finMin: 1200 }],
    });
    expect(dia([miercoles], datos())).toEqual([]);
  });
  it("la ventana recorre varios días y ordena por inicio", () => {
    const c = calcularCupos(
      SERVICIO,
      [psi("a", [[480, 540]])],
      bog("2026-11-24", 0),
      bog("2026-12-09", 0),
      AHORA,
      datos(),
    );
    expect(c.map((x) => x.inicio.slice(0, 10))).toEqual([
      "2026-11-24",
      "2026-12-01",
      "2026-12-08",
    ]);
  });
});
