import { describe, expect, it } from "vitest";
import { citaSchema } from "../../../contratos/cita";
import { aEntrada } from "./entrada";
import type { Borrador } from "./piezas";

const base: Borrador = {
  servicioId: "srv-1",
  paraQuien: "PROPIA",
  pacienteNombre: "Quedó de antes",
  pacienteDocumento: "999999",
  pacienteEdad: "15",
  acudienteNombre: "Quedó de antes",
  acudienteDocumento: "888888",
  psicologoId: "",
  psicologoNombre: "",
  inicio: "2026-11-24T19:30:00.000Z",
  solicitanteNombre: " Ana Ruiz ",
  solicitanteDocumento: "1020304050",
  solicitanteCorreo: "Ana@Correo.co",
  solicitanteTelefono: "300 123 4567",
  motivo: "  ",
  sitioWeb: "",
  aceptaTratamiento: true,
};

describe("aEntrada (borrador de /pedir-cita → citaSchema)", () => {
  it("para mí: el documento es el de quien pide y no viajan datos de otro paso", () => {
    const e = aEntrada(base);
    expect(citaSchema.safeParse(e).success).toBe(true);
    expect(e).toMatchObject({
      pacienteDocumento: "1020304050",
      pacienteNombre: undefined,
      pacienteEdad: undefined,
      acudienteNombre: undefined,
      psicologoId: undefined,
      motivo: undefined,
    });
  });

  it("menor: lleva edad y acudiente, y pasa el esquema", () => {
    const e = aEntrada({ ...base, paraQuien: "MENOR", pacienteDocumento: "" });
    expect(citaSchema.safeParse(e).success).toBe(true);
    expect(e).toMatchObject({ pacienteEdad: 15, acudienteDocumento: "888888" });
  });

  it("otra persona: sin edad ni acudiente", () => {
    const e = aEntrada({ ...base, paraQuien: "OTRA_PERSONA" });
    expect(citaSchema.safeParse(e).success).toBe(true);
    expect(e.pacienteEdad).toBeUndefined();
    expect(e.acudienteNombre).toBeUndefined();
  });
});
