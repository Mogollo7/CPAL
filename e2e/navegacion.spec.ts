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

test("las llamadas de Ayuda inmediata quedan accesibles a 320 px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/ayuda-inmediata");
  await expect(
    page.getByRole("complementary", { name: "Aviso de cookies" }),
  ).toBeVisible();

  const principal = page.locator('main a[href="tel:123"]').first();
  await principal.click({ trial: true });

  const directorio = page.getByRole("region", { name: "Líneas gratuitas" });
  const llamadas = directorio.locator('a[href^="tel:"]');
  await expect(llamadas).toHaveCount(4);
  await expect(page.locator('a[href="tel:4444448"]')).toHaveCount(0);

  for (const enlace of await llamadas.all()) {
    await enlace.click({ trial: true });
    const cumple = await enlace.evaluate((elemento) => {
      const boton = elemento.getBoundingClientRect();
      const fila = elemento.closest("li")!.getBoundingClientRect();
      const texto = elemento.previousElementSibling!.getBoundingClientRect();
      return (
        boton.height >= 48 &&
        boton.left >= fila.left &&
        boton.right <= fila.right &&
        boton.top >= texto.bottom
      );
    });
    expect(cumple).toBe(true);
  }
});

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
