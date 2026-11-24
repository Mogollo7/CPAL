import { expect, test } from "@playwright/test";

test("la navegación editorial suaviza el cambio y deja la ayuda inmediata", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    document.addEventListener("animationstart", (evento) => {
      if (evento.animationName === "capl-entrada-ruta") {
        document.documentElement.dataset.entrada = location.pathname;
      }
    });
  });
  await page.goto("/servicios");
  await page
    .getByRole("navigation", { name: "Principal" })
    .getByRole("link", { name: "Contacto" })
    .click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-entrada",
    "/contacto",
  );
  await page.locator('a[href="/ayuda-inmediata"]').last().click();
  await expect(page).toHaveURL(/\/ayuda-inmediata$/);
  await expect(page.locator('main a[href="tel:123"]').first()).toBeVisible();
  await expect(page.locator("#contenido-principal")).toHaveCSS(
    "animation-name",
    "none",
  );
});

test("una ilustración editorial entra una vez y sigue visible al releer", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const observar = IntersectionObserver.prototype.observe;
    IntersectionObserver.prototype.observe = function (objetivo) {
      if (objetivo instanceof HTMLImageElement)
        objetivo.dataset.observado = "si";
      observar.call(this, objetivo);
    };
    const animar = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      if (this instanceof HTMLImageElement) {
        this.dataset.animaciones = String(
          Number(this.dataset.animaciones ?? 0) + 1,
        );
      }
      return animar.apply(this, args);
    };
  });
  await page.goto("/servicios");
  const imagen = page.locator('main article img[data-observado="si"]').last();
  await expect(imagen).toBeAttached();
  await page.evaluate(
    () =>
      new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r())),
      ),
  );
  await imagen.scrollIntoViewIfNeeded();
  await expect(imagen).toHaveAttribute("data-animaciones", /[1-9]/);
  const cantidad = await imagen.getAttribute("data-animaciones");
  await expect(imagen).toHaveCSS("opacity", "1");
  await page.getByRole("heading", { level: 1 }).scrollIntoViewIfNeeded();
  await imagen.scrollIntoViewIfNeeded();
  await expect(imagen).toHaveAttribute("data-animaciones", cantidad!);
});

test("los retratos se activan y pausan con teclado y respetan cambios del sistema", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/contacto");
  const retratos = page.locator(".capl-marquesina");
  const control = page.getByRole("checkbox", { name: "Animar los retratos" });
  await expect(retratos).toHaveCSS("animation-play-state", "paused");
  await control.focus();
  await page.keyboard.press("Space");
  await expect(retratos).toHaveCSS("animation-play-state", "running");
  await page.keyboard.press("Space");
  await expect(retratos).toHaveCSS("animation-play-state", "paused");
  await page.keyboard.press("Space");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(retratos).toHaveCSS("animation-name", "none");
  await expect(control).toBeHidden();
});

test("con movimiento reducido las imágenes y las acciones de ayuda están disponibles", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/servicios");
  const imagen = page.locator("main article img").last();
  await imagen.scrollIntoViewIfNeeded();
  expect(await imagen.evaluate((e) => e.getAnimations().length)).toBe(0);
  await expect(imagen).toHaveCSS("opacity", "1");
  await page.goto("/ayuda-inmediata");
  await expect(page.locator('main a[href="tel:123"]').first()).toBeVisible();
  await expect(page.locator("#contenido-principal")).toHaveCSS(
    "animation-name",
    "none",
  );
});

test("el contenido editorial queda visible sin JavaScript", async ({
  browser,
  baseURL,
}) => {
  const contexto = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  try {
    const pagina = await contexto.newPage();
    await pagina.goto("/servicios");
    const paso = pagina.locator('[aria-labelledby="titulo-resumen"] li').last();
    await paso.scrollIntoViewIfNeeded();
    await expect(paso).toBeVisible();
    await expect(paso).toHaveCSS("opacity", "1");
    await expect(
      pagina.getByRole("link", { name: "Necesito ayuda ahora" }),
    ).toBeVisible();
  } finally {
    await contexto.close();
  }
});
