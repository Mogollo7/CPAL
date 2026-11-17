// Plantilla base de todos los correos (E06): logo arriba, tarjeta blanca, UN solo botón, pie con contacto y la línea
// "Si necesitas ayuda ahora mismo". Devuelve HTML y texto plano. Los colores son los tokens de N02 escritos en línea
// (los correos no pueden leer CSS externo). El diseño final de Figma se aplica aquí sin tocar a quien la usa.
// Nunca recibe motivo de consulta, documento ni edad (RNF-PRI-05): esas variables simplemente no existen aquí.
const C = {
  fondo: "#FFFBF5",
  tarjeta: "#FFFFFF",
  titulo: "#1B2C65",
  texto: "#0B1037",
  suave: "#50557A",
  boton: "#4850C0",
  amarillo: "#FFCB05",
};

export type EntradaBase = {
  asunto: string; // se usa también como título
  parrafos: string[]; // texto plano; aquí se escapa
  boton?: { texto: string; ruta: string }; // ruta relativa: se arma con URL_SITIO (RES-TEC-05)
  destacado?: string; // texto grande (p. ej. el código de ingreso)
  enlaces?: { texto: string; url: string }[]; // enlaces de apoyo (calendarios), NO son botones
};

export type CorreoRender = {
  asunto: string;
  html: string;
  texto: string;
  adjuntos?: { nombre: string; contenido: string; tipo: string }[];
};

/** Escapa HTML: un nombre como `<script>` o `"><img…` llega como texto, no como código. */
export const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sitio = () => (process.env.URL_SITIO ?? "").replace(/\/$/, "");

export function plantillaBase(e: EntradaBase): CorreoRender {
  const ayuda = `${sitio()}/ayuda-inmediata`;
  const contacto = process.env.CORREO_RESPUESTA ?? "";
  const direccion = process.env.CAPL_DIRECCION ?? "";
  const url = e.boton ? `${sitio()}${e.boton.ruta}` : "";

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;background:${C.fondo};font-family:system-ui,Arial,sans-serif;color:${C.texto};line-height:1.6">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:26px 16px">
<table role="presentation" width="100%" style="max-width:560px" cellpadding="0" cellspacing="0">
<tr><td style="padding:0 0 16px"><span style="display:inline-block;background:${C.amarillo};border-radius:16px;padding:6px 16px;font-weight:800;color:${C.texto}">CAPL</span></td></tr>
<tr><td style="background:${C.tarjeta};border-radius:26px;padding:26px">
<h1 style="margin:0 0 16px;font-size:20px;line-height:1.272;color:${C.titulo}">${esc(e.asunto)}</h1>
${e.parrafos.map((p) => `<p style="margin:0 0 16px;font-size:16px">${esc(p)}</p>`).join("\n")}
${e.destacado ? `<p style="margin:0 0 16px;font-size:34px;font-weight:800;letter-spacing:6px;color:${C.titulo}">${esc(e.destacado)}</p>` : ""}${(e.enlaces ?? []).map((l) => `<p style="margin:0 0 8px;font-size:15px"><a href="${esc(l.url)}" style="color:${C.boton}">${esc(l.texto)}</a></p>`).join("\n")}
${e.boton ? `<p style="margin:26px 0 0"><a href="${esc(url)}" style="display:inline-block;background:${C.boton};color:#FFFFFF;text-decoration:none;font-weight:600;border-radius:9999px;padding:14px 26px">${esc(e.boton.texto)}</a></p>` : ""}
</td></tr>
<tr><td style="padding:16px 8px;font-size:13px;color:${C.suave}">
${direccion ? `<p style="margin:0 0 6px">${esc(direccion)}</p>` : ""}${contacto ? `<p style="margin:0 0 6px">Escríbenos: ${esc(contacto)}</p>` : ""}
<p style="margin:0">Si necesitas ayuda ahora mismo, <a href="${esc(ayuda)}" style="color:${C.titulo}">entra aquí</a>.</p>
</td></tr></table></td></tr></table></body></html>`;

  const texto = [
    e.asunto,
    "",
    ...e.parrafos,
    ...(e.destacado ? ["", e.destacado] : []),
    ...(e.enlaces ?? []).flatMap((l) => ["", `${l.texto}: ${l.url}`]),
    ...(e.boton ? ["", `${e.boton.texto}: ${url}`] : []),
    "",
    "—",
    ...(direccion ? [direccion] : []),
    ...(contacto ? [`Escríbenos: ${contacto}`] : []),
    `Si necesitas ayuda ahora mismo: ${ayuda}`,
  ].join("\n");

  return { asunto: e.asunto, html, texto };
}
