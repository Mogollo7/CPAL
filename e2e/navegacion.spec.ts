import { expect, test } from "@playwright/test";

// Todas las rutas públicas responden, tienen un solo h1 y no desbordan en móvil (375 px).
const RUTAS = [
  "/",
  "/servicios",
  "/como-funciona",
  "/equipo",
  "/contacto",
  "/eventos",
  "/ayuda-inmediata",
  "/pedir-cita",
  "/privacidad",
  "/terminos",
  "/ingresar",
];

for (const ruta of RUTAS) {
  test(`${ruta}: carga, un h1 y sin desborde horizontal en móvil`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    const r = await page.goto(ruta);
    expect(r?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    const desborde = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(desborde).toBeLessThanOrEqual(0);
  });
}
