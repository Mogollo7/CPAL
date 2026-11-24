import { expect, test } from "@playwright/test";

// Rutas públicas (copiadas de navegacion.spec.ts excepto /ingresar).
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
];

for (const ruta of RUTAS) {
  test(`${ruta}: enlaces internos válidos, ningún a[href="#"] y botones accesibles`, async ({
    page,
  }) => {
    const respuesta = await page.goto(ruta);
    expect(respuesta?.status()).toBeLessThan(400);

    // Todos los a[href^="/"] únicos responden < 400 con page.request.get (ignora /api).
    const enlaces = await page
      .locator('a[href^="/"]')
      .evaluateAll((elementos) =>
        elementos
          .map((el) => el.getAttribute("href"))
          .filter((href): href is string => Boolean(href)),
      );

    const enlacesUnicos = Array.from(new Set(enlaces)).filter(
      (href) => !href.startsWith("/api") && !href.startsWith("//"),
    );

    for (const href of enlacesUnicos) {
      const res = await page.request.get(href);
      expect(
        res.status(),
        `El enlace «${href}» en la ruta «${ruta}» debe responder con estado menor a 400`,
      ).toBeLessThan(400);
    }

    // Ningún a[href="#"]
    await expect(page.locator('a[href="#"]')).toHaveCount(0);

    // Todo button visible tiene nombre accesible (texto o aria-label).
    const botonesVisibles = page.locator("button:visible");
    const totalBotones = await botonesVisibles.count();
    for (let i = 0; i < totalBotones; i++) {
      const boton = botonesVisibles.nth(i);
      const texto = (await boton.textContent())?.trim() ?? "";
      const ariaLabel = (await boton.getAttribute("aria-label"))?.trim() ?? "";
      const ariaLabelledBy =
        (await boton.getAttribute("aria-labelledby"))?.trim() ?? "";
      const nombreAccesible = ariaLabel || ariaLabelledBy || texto;
      expect(
        nombreAccesible.length,
        `El botón visible en la ruta «${ruta}» debe tener un nombre accesible (texto o aria-label)`,
      ).toBeGreaterThan(0);
    }
  });
}
