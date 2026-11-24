import { expect, test } from "@playwright/test";

// Pruebas de acceso al panel y autenticación.

test.describe("Acceso y autenticación", () => {
  for (const [ruta, imagen] of [
    ["/ingresar", "acceso-ingresar"],
    ["/recuperar-clave", "acceso-recuperar"],
    ["/crear-clave/ejemplo-visual", "acceso-crear-clave"],
  ]) {
    test(`${ruta} conserva la ilustración en escritorio`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(ruta);
      const ilustracion = page.locator(`main img[src*="${imagen}"]`);
      const formulario = page.locator("main form");
      await expect(ilustracion).toBeVisible();
      await ilustracion.evaluate((img: HTMLImageElement) => img.decode());
      const arte = await ilustracion.boundingBox();
      const campos = await formulario.boundingBox();
      expect(arte!.x).toBeGreaterThanOrEqual(campos!.x + campos!.width);

      await page.setViewportSize({ width: 390, height: 844 });
      await expect(ilustracion).toBeHidden();
      await expect(formulario).toBeVisible();
    });
  }

  test("/panel sin sesión redirige a /ingresar", async ({ page }) => {
    await page.goto("/panel");
    await expect(page).toHaveURL(/\/ingresar/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Ingresar al panel" }),
    ).toBeVisible();
  });

  test("el ingreso válido de psicólogo carga Mis citas", async ({ page }) => {
    await page.goto("/ingresar");

    await page
      .getByLabel("Correo", { exact: true })
      .fill("psicologo1@ejemplo.test");
    await page
      .getByLabel("Contraseña", { exact: true })
      .fill("clave-de-prueba-capl");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page).toHaveURL(/\/panel\/psicologo\/citas/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Mis citas" }),
    ).toBeVisible();
  });

  test("ingreso con clave equivocada muestra mensaje de error y mantiene la URL en /ingresar", async ({
    page,
  }) => {
    await page.goto("/ingresar");

    await page
      .getByLabel("Correo", { exact: true })
      .fill("psicologo1@ejemplo.test");
    await page
      .getByLabel("Contraseña", { exact: true })
      .fill("clave-incorrecta-123");
    await page.getByRole("button", { name: "Ingresar" }).click();

    const alerta = page.getByRole("alert").filter({ hasText: /contraseña/i });
    await expect(alerta).toBeVisible();
    await expect(alerta).toHaveText(
      /correo o contraseña incorrectos|credenciales/i,
    );
    await expect(page).toHaveURL(/\/ingresar/);
    expect(new URL(page.url()).pathname).toBe("/ingresar");
  });
});
