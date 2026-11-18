import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "./robots";
import sitemap from "./sitemap";

afterEach(() => vi.unstubAllEnvs());

describe("robots y mapa del sitio", () => {
  it("fuera de producción bloquea todo y no lista páginas", () => {
    for (const entorno of ["local", "pruebas", undefined]) {
      vi.stubEnv("ENTORNO", entorno as string);
      expect(robots().rules).toEqual({ userAgent: "*", disallow: "/" });
      expect(sitemap()).toEqual([]);
    }
  });

  it("en producción abre lo público y cierra panel, acceso y enlaces con token", () => {
    vi.stubEnv("ENTORNO", "produccion");
    vi.stubEnv("URL_SITIO", "https://capl.example.edu/");
    const r = robots();
    expect(JSON.stringify(r.rules)).toContain("/panel");
    expect(r.sitemap).toBe("https://capl.example.edu/sitemap.xml");
    const m = sitemap().map((x) => x.url);
    expect(m).toContain("https://capl.example.edu/ayuda-inmediata");
    expect(m.some((u) => u.includes("/panel") || u.includes("/cita/"))).toBe(
      false,
    );
  });
});
