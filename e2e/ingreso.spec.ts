import { expect, test } from "@playwright/test";

// Pruebas de acceso al panel y autenticación.

test.describe("Acceso y autenticación", () => {
  test("/panel sin sesión redirige a /ingresar", async ({ page }) => {
    await page.goto("/panel");
    await expect(page).toHaveURL(/\/ingresar/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Ingresar a la plataforma" }),
    ).toBeVisible();
  });

  test("ingreso con credenciales válidas de psicólogo redirige a una URL que empieza por /panel", async ({
    page,
  }) => {
    await page.goto("/ingresar");

    await page
      .getByLabel("Correo institucional")
      .fill("psicologo1@ejemplo.test");
    await page
      .getByLabel("Contraseña", { exact: true })
      .fill("clave-de-prueba-capl");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page).toHaveURL(/\/panel/);
    expect(new URL(page.url()).pathname.startsWith("/panel")).toBe(true);
  });

  test("ingreso con clave equivocada muestra mensaje de error y mantiene la URL en /ingresar", async ({
    page,
  }) => {
    await page.goto("/ingresar");

    await page
      .getByLabel("Correo institucional")
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
