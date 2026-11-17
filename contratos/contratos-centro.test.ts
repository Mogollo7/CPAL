import { describe, expect, it } from "vitest";
import { bloqueoSchema } from "./bloqueo";
import { cambioConfiguracionSchema } from "./configuracion";
import { eventoSchema } from "./evento";
import { crearPsicologoSchema, perfilSchema } from "./psicologo";
import { servicioSchema } from "./servicio";

describe("contratos de psicólogo, centro y eventos", () => {
  it("crear psicólogo normaliza el correo y exige área", () => {
    expect(
      crearPsicologoSchema.parse({
        nombre: "Ana Ruiz",
        correo: " ANA@U.edu.co ",
        area: "PSICOLOGIA",
      }).correo,
    ).toBe("ana@u.edu.co");
    expect(
      crearPsicologoSchema.safeParse({ nombre: "Ana Ruiz", correo: "a@u.co" })
        .success,
    ).toBe(false);
  });
  it("presentación de máx. 600 caracteres", () => {
    const base = { servicioIds: [], visible: true };
    expect(
      perfilSchema.safeParse({ ...base, presentacion: "a".repeat(600) })
        .success,
    ).toBe(true);
    expect(
      perfilSchema.safeParse({ ...base, presentacion: "a".repeat(601) })
        .success,
    ).toBe(false);
  });
  it("bloqueo: hasta posterior a desde", () => {
    const b = {
      desde: "2026-12-02T08:00:00-05:00",
      hasta: "2026-12-02T08:00:00-05:00",
    };
    expect(bloqueoSchema.safeParse(b).success).toBe(false);
  });
  it("configuración parcial con límites; rechaza claves desconocidas y vacío", () => {
    expect(
      cambioConfiguracionSchema.safeParse({ maxCitasActivas: 2 }).success,
    ).toBe(true);
    expect(
      cambioConfiguracionSchema.safeParse({ maxCitasActivas: 0 }).success,
    ).toBe(false);
    expect(
      cambioConfiguracionSchema.safeParse({ duracionEnlaceHoras: 72 }).success,
    ).toBe(false);
    expect(cambioConfiguracionSchema.safeParse({ inventado: 1 }).success).toBe(
      false,
    );
    expect(cambioConfiguracionSchema.safeParse({}).success).toBe(false);
    expect(
      cambioConfiguracionSchema.safeParse({
        dominiosPermitidos: ["Unilasallista.edu.co"],
      }),
    ).toMatchObject({
      success: true,
      data: { dominiosPermitidos: ["unilasallista.edu.co"] },
    });
  });
  it("servicio y evento", () => {
    expect(
      servicioSchema.safeParse({
        nombre: "Atención",
        descripcion: "x",
        duracionMin: 60,
        area: "PSICOLOGIA",
        agendableEnLinea: true,
        activo: true,
      }).success,
    ).toBe(true);
    const e = {
      titulo: "Taller",
      descripcion: "x",
      inicio: "2026-12-01T10:00:00-05:00",
      lugar: "Virtual",
      publicado: false,
    };
    expect(eventoSchema.safeParse(e).success).toBe(true);
    expect(
      eventoSchema.safeParse({ ...e, fin: "2026-12-01T09:00:00-05:00" })
        .success,
    ).toBe(false);
    expect(
      eventoSchema.safeParse({ ...e, enlace: "javascript:alert(1)" }).success,
    ).toBe(false);
  });
});
