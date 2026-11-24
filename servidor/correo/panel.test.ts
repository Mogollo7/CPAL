import { beforeEach, describe, expect, it, vi } from "vitest";
import { reintentarTrabajo, trabajosFallidos } from "./panel";

const { findMany, updateMany, auditar } = vi.hoisted(() => ({
  findMany: vi.fn(),
  updateMany: vi.fn(),
  auditar: vi.fn(),
}));

vi.mock("../bd", () => ({
  bd: {
    trabajo: { findMany },
    $transaction: (
      operacion: (tx: {
        trabajo: { updateMany: typeof updateMany };
      }) => unknown,
    ) => operacion({ trabajo: { updateMany } }),
  },
}));
vi.mock("../auditoria", () => ({ auditar }));

beforeEach(() => vi.resetAllMocks());

describe("correos fallidos del panel", () => {
  it("filtra por tipo y estado antes del límite y no devuelve identificadores internos ni errores técnicos", async () => {
    const creadoEn = new Date(0);
    findMany.mockResolvedValue([
      {
        id: "envio",
        llave: "correo:invitacion:interno:1",
        intentos: 6,
        creadoEn,
      },
    ]);

    await expect(trabajosFallidos()).resolves.toEqual({
      cantidad: 1,
      trabajos: [
        { id: "envio", plantilla: "invitacion", intentos: 6, creadoEn },
      ],
    });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tipo: "CORREO", estado: "FALLIDO" },
        take: 100,
        select: { id: true, llave: true, intentos: true, creadoEn: true },
      }),
    );
  });

  it("no reencola ni audita un trabajo que dejó de cumplir las condiciones", async () => {
    updateMany.mockResolvedValue({ count: 0 });
    await expect(reintentarTrabajo("envio", "admin")).resolves.toEqual({
      ok: false,
    });
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "envio", tipo: "CORREO", estado: "FALLIDO" },
      }),
    );
    expect(auditar).not.toHaveBeenCalled();
  });
});
