import { expect, test } from "@playwright/test";

// Pruebas de formularios públicos: filtro de eventos, consulta de cita y solicitud de cita.

test.describe("Formularios públicos", () => {
  test("/eventos: filtrado por chip de tipo y manejo de tipo inválido", async ({
    page,
  }) => {
    await page.goto("/eventos");

    const chipCharla = page
      .getByRole("navigation", { name: "Filtro por tipo de evento" })
      .getByRole("link", { name: "Charla" });

    await chipCharla.click();
    await expect(page).toHaveURL(/\/eventos\?tipo=CHARLA/);
    await expect(chipCharla).toHaveAttribute("aria-current", "page");

    // Con un tipo no reconocido (?tipo=XX) la página carga sin error
    const respuesta = await page.goto("/eventos?tipo=XX");
    expect(respuesta?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(
      page.getByText("No hay eventos de este tipo por ahora."),
    ).toBeVisible();
  });

  test("pie: consultar cita con código válido muestra mensaje explicativo", async ({
    page,
  }) => {
    await page.goto("/");

    const campoCodigo = page.getByLabel("Consultar mi cita");
    const botonConsultar = page.getByRole("button", { name: "Consultar" });

    await campoCodigo.fill("CAPL-ABCD");
    await botonConsultar.click();

    const aviso = page.getByRole("status");
    await expect(aviso).toBeVisible();
    await expect(aviso).toHaveText(/^Si el código/);
  });

  test("pie: consultar cita con valor inválido ('hola') no envía por restricción HTML", async ({
    page,
  }) => {
    await page.goto("/");

    const campoCodigo = page.getByLabel("Consultar mi cita");
    const botonConsultar = page.getByRole("button", { name: "Consultar" });

    await campoCodigo.fill("hola");
    await botonConsultar.click();

    const esInvalido = await campoCodigo.evaluate((input: HTMLInputElement) => {
      return !input.checkValidity() && input.validity.patternMismatch;
    });
    expect(esInvalido).toBe(true);

    // No se envía el formulario ni aparece mensaje de estado
    await expect(page.getByRole("status")).toHaveCount(0);
  });

  test("/pedir-cita: carga y muestra el primer paso", async ({ page }) => {
    const respuesta = await page.goto("/pedir-cita");
    expect(respuesta?.status()).toBe(200);

    await expect(page.locator("h1")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "¿Qué servicio necesitas agendar?",
      }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuar" })).toBeVisible();
  });
});
