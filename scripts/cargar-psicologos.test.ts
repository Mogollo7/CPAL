import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { cargar, validarCsv, type BdCarga } from "./cargar-psicologos";

const CAB = "correo,nombre,area,horario\n";
const ok = "a@u.test,Ana Ficticia,PSICOLOGIA,lun 08:00-12:00; mar 14:00-18:00";

describe("validarCsv", () => {
  it("acepta la plantilla de ejemplo", () => {
    const r = validarCsv(
      readFileSync("infra/plantillas/psicologos-ejemplo.csv", "utf8"),
    );
    expect(r.errores).toEqual([]);
    expect(r.filas).toHaveLength(3);
    expect(r.filas[2].bloques[0]).toEqual({
      diaSemana: 3,
      inicioMin: 840,
      finMin: 1080,
    });
  });

  it("convierte días y horas, y normaliza el correo", () => {
    const r = validarCsv(
      CAB + "ANA@U.test,Ana Ficticia,psicologia,lun 08:00-12:00",
    );
    expect(r.filas[0]).toMatchObject({
      correo: "ana@u.test",
      area: "PSICOLOGIA",
    });
    expect(r.filas[0].bloques).toEqual([
      { diaSemana: 1, inicioMin: 480, finMin: 720 },
    ]);
  });

  it.each([
    ["cabecera mala", "x,y\n" + ok, 1],
    ["columnas de menos", CAB + "a@u.test,Ana Ficticia,PSICOLOGIA", 2],
    [
      "correo inválido",
      CAB + "nada,Ana Ficticia,PSICOLOGIA,lun 08:00-12:00",
      2,
    ],
    ["área desconocida", CAB + "a@u.test,Ana Ficticia,OTRA,lun 08:00-12:00", 2],
    [
      "día desconocido",
      CAB + "a@u.test,Ana Ficticia,PSICOLOGIA,xyz 08:00-12:00",
      2,
    ],
    [
      "fin antes del inicio",
      CAB + "a@u.test,Ana Ficticia,PSICOLOGIA,lun 12:00-08:00",
      2,
    ],
    [
      "bloques cruzados",
      CAB + "a@u.test,Ana Ficticia,PSICOLOGIA,lun 08:00-12:00; lun 11:00-13:00",
      2,
    ],
    ["horario vacío", CAB + "a@u.test,Ana Ficticia,PSICOLOGIA,", 2],
    ["correo repetido", CAB + ok + "\n" + ok, 3],
  ])("rechaza: %s", (_n, texto, linea) => {
    const r = validarCsv(texto);
    expect(r.errores[0].linea).toBe(linea);
  });

  it("comprueba el dominio solo si se le dan dominios", () => {
    expect(validarCsv(CAB + ok, ["otro.test"]).errores).toHaveLength(1);
    expect(validarCsv(CAB + ok, ["u.test"]).errores).toHaveLength(0);
  });
});

describe("cargar", () => {
  const filas = validarCsv(CAB + ok).filas;
  const bdFalsa = (existe: boolean) => {
    const create = vi.fn();
    return {
      create,
      bd: {
        servicio: { findMany: async () => [{ id: "s1", area: "PSICOLOGIA" }] },
        usuario: {
          findUnique: async () => (existe ? { id: "u" } : null),
          create,
        },
      } as unknown as BdCarga,
    };
  };

  it("--simular no escribe", async () => {
    const { bd, create } = bdFalsa(false);
    expect((await cargar(bd, filas, true)).nuevos).toEqual(["a@u.test"]);
    expect(create).not.toHaveBeenCalled();
  });

  it("crea los nuevos y omite los existentes (idempotente)", async () => {
    const a = bdFalsa(false);
    await cargar(a.bd, filas, false);
    expect(a.create).toHaveBeenCalledTimes(1);
    const b = bdFalsa(true);
    expect((await cargar(b.bd, filas, false)).existentes).toEqual(["a@u.test"]);
    expect(b.create).not.toHaveBeenCalled();
  });
});
