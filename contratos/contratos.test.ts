import { describe, expect, it } from "vitest";
import { citaSchema } from "./cita";
import { consultaCupoSchema } from "./cupo";
import { horarioSchema } from "./horario";

const base = {
  servicioId: "s1",
  inicio: "2026-11-24T10:00:00-05:00",
  paraQuien: "PROPIA" as const,
  solicitanteNombre: "Ana Pérez",
  solicitanteCorreo: "ANA@Mail.com",
  solicitanteTelefono: "+57 300 1234567",
  aceptaTratamiento: true as const,
  sitioWeb: "",
};

describe("contratos", () => {
  it("cita propia válida; normaliza correo", () => {
    expect(citaSchema.parse(base).solicitanteCorreo).toBe("ana@mail.com");
  });
  it("menor exige acudiente; campo trampa debe ir vacío", () => {
    expect(
      citaSchema.safeParse({
        ...base,
        paraQuien: "MENOR",
        pacienteNombre: "Leo",
      }).success,
    ).toBe(false);
    expect(citaSchema.safeParse({ ...base, sitioWeb: "spam" }).success).toBe(
      false,
    );
  });
  it("edad < 18 obliga a MENOR", () => {
    expect(citaSchema.safeParse({ ...base, pacienteEdad: 10 }).success).toBe(
      false,
    );
  });
  it("horario rechaza bloques cruzados", () => {
    const b = (inicioMin: number, finMin: number) => ({
      diaSemana: 1,
      inicioMin,
      finMin,
    });
    expect(
      horarioSchema.safeParse({ bloques: [b(480, 720), b(600, 800)] }).success,
    ).toBe(false);
    expect(
      horarioSchema.safeParse({ bloques: [b(480, 720), b(720, 800)] }).success,
    ).toBe(true);
  });
  it("cupos: máximo 14 días", () => {
    const q = { servicioId: "s1", desde: "2026-11-01T00:00:00Z" };
    expect(
      consultaCupoSchema.safeParse({ ...q, hasta: "2026-11-14T00:00:00Z" })
        .success,
    ).toBe(true);
    expect(
      consultaCupoSchema.safeParse({ ...q, hasta: "2026-11-20T00:00:00Z" })
        .success,
    ).toBe(false);
  });
});
