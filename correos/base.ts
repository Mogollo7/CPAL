import { formatoHora, ZONA } from "../servidor/fechas";

export type EntradaBase = {
  asunto: string;
  titulo?: string;
  archivoCalendario?: boolean;
  parrafos: string[];
  boton?: { texto: string; ruta: string };
  destacado?: string;
  enlaces?: { texto: string; url: string }[];
  tono?: string;
  ilustracion?: string;
  disposicion?: "centrada" | "fila";
  bajada?: string;
  fecha?: {
    mes: string;
    dia: string;
    rotulo: string;
    hora: string;
    linea: string;
  };
  datos?: { rotulo: string; valor: string }[];
  pie_datos?: string;
  nota?: { titulo: string; texto: string };
};
export type CorreoRender = {
  asunto: string;
  html: string;
  texto: string;
  adjuntos?: { nombre: string; contenido: string; tipo: string }[];
};
export const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
const sitio = () => (process.env.URL_SITIO ?? "").replace(/\/$/, "");

const alturas: Readonly<Partial<Record<string, number>>> = {
  "clave-sobre": 119,
  "gato-acompanamiento": 178,
  "gato-aprobacion": 178,
  "gato-calendario": 60,
  "gato-recordatorio": 188,
  "gato-reprogramacion": 89,
  "gato-saludo": 178,
  "seguridad-escudo": 163,
};

export function plantillaBase(e: EntradaBase): CorreoRender {
  const ayuda = `${sitio()}/ayuda-inmediata`;
  const contacto = process.env.CORREO_RESPUESTA ?? "";
  const direccion =
    process.env.CAPL_DIRECCION || "Casa amarilla del CAPL · Caldas, Antioquia";
  const url = e.boton ? `${sitio()}${e.boton.ruta}` : "";
  const bajada = e.bajada ?? e.parrafos[0] ?? "";
  const cuerpo = e.bajada === undefined ? e.parrafos.slice(1) : e.parrafos;
  const img = e.ilustracion
    ? `<img src="${esc(`${sitio()}/correos/${e.ilustracion}.png`)}" width="178" height="${esc(String(alturas[e.ilustracion] ?? 178))}" alt="" style="display:block;width:178px;height:auto;max-width:100%">`
    : "";
  const resumen = `<h1 style="margin:0;color:#1c2956;font-size:34px;line-height:39px;font-weight:700">${esc(e.titulo ?? e.asunto)}</h1>${bajada ? `<p style="margin:12px 0 0;color:#4c536b;font-size:17px;line-height:24px">${esc(bajada)}</p>` : ""}`;
  const fecha = e.fecha
    ? `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" width="94" style="background:#e7f3ef;border-radius:12px;padding:10px 0;color:#246659;font-weight:bold"><span style="font-size:12px;text-transform:uppercase">${esc(e.fecha.mes.toLocaleUpperCase("es-CO"))}</span><br><span style="font-size:38px;line-height:47px">${esc(e.fecha.dia)}</span></td><td style="padding-left:18px"><span style="font-size:14px;font-weight:bold;color:#246659">${esc(e.fecha.rotulo)}</span><br><span style="font-size:32px;line-height:40px;font-weight:bold;color:#1d2853">${esc(e.fecha.hora)}</span><br><span style="font-size:17px;color:#4c536b">${esc(e.fecha.linea)}</span></td></tr></table>`
    : "";
  const datos = (e.datos ?? [])
    .map(
      (d, index) =>
        `${index > 0 && index % 2 === 0 ? "</tr><tr>" : ""}<td ${index % 2 === 0 && index === (e.datos?.length ?? 0) - 1 ? 'colspan="2"' : ""} valign="top" style="padding:8px 16px 0 0"><span style="font-size:14px;font-weight:bold;color:#4c536b">${esc(d.rotulo)}</span><br><span style="font-size:19px;font-weight:bold;color:#1d2853">${esc(d.valor)}</span></td>`,
    )
    .join("");
  const tarjetaDatos =
    fecha || datos || e.pie_datos
      ? `<tr><td style="padding-top:14px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px"><tr><td style="padding:26px 28px">${fecha}${fecha && datos ? '<div style="border-top:1px solid #e6e7ea;margin:17px 0 0"></div>' : ""}${datos ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${datos}</tr></table>` : ""}${e.pie_datos ? `<p style="font-size:14px;color:#4c536b;margin:14px 0 0">${esc(e.pie_datos)}</p>` : ""}</td></tr></table></td></tr>`
      : "";
  const bloqueNota = (titulo: string, texto: string) =>
    `<tr><td style="padding-top:14px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px"><tr><td style="padding:18px;color:#4c536b;font-size:16px;line-height:22px">${titulo ? `<strong style="font-size:17px;color:#1c2956">${esc(titulo)}</strong><br>` : ""}${esc(texto)}</td></tr></table></td></tr>`;
  const enlacesCalendario = (e.enlaces ?? []).map(
    (enlace) =>
      `<a style="color:#4a4fc1;text-decoration:none" href="${esc(enlace.url)}">${esc(enlace.texto)}</a>`,
  );
  if (e.archivoCalendario)
    enlacesCalendario.push('<span style="color:#4a4fc1">Archivo .ics</span>');
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap" rel="stylesheet"></head>
<body style="margin:0;background:#faf9f6;font-family:Nunito,Arial,sans-serif;color:#1c2956"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#faf9f6;border-radius:12px"><tr><td style="padding:4px 32px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td height="84"><img src="${esc(`${sitio()}/correos/logo-capl.png`)}" width="106" height="106" alt="" style="display:block;width:106px;height:auto;max-height:84px;object-fit:contain"></td><td align="right" style="font-size:14px;line-height:17px;font-weight:bold;color:#49516b">Centro de Atención<br>Psicológica Lasallista</td></tr></table></td></tr>
<tr><td style="background:${esc(e.tono ?? "#efeefb")};border-radius:18px;padding:28px">${e.disposicion === "fila" ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="178" valign="middle" style="width:34.2%;padding-right:22px">${img}</td><td valign="middle">${resumen}</td></tr></table>` : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">${img}<div style="margin-top:12px">${resumen}</div></td></tr></table>`}</td></tr>
${tarjetaDatos}
${cuerpo.map((p) => bloqueNota("", p)).join("")}${e.destacado ? `<tr><td style="padding-top:14px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:20px;background:#fff;border-radius:12px;font-size:38px;font-weight:bold;color:#4a4fc1">${esc(e.destacado)}</td></tr></table></td></tr>` : ""}${e.nota ? bloqueNota(e.nota.titulo, e.nota.texto) : ""}${enlacesCalendario.length ? `<tr><td align="center" style="padding-top:18px;font-size:15px;font-weight:bold">${enlacesCalendario.join(" · ")}</td></tr>` : ""}${e.boton ? `<tr><td align="center" style="padding:18px 0"><a href="${esc(url)}" style="display:inline-block;box-sizing:border-box;width:236px;padding:15px 8px;line-height:20px;background:#4a4fc1;color:#fff;text-decoration:none;font-size:17px;font-weight:bold;border-radius:9999px">${esc(e.boton.texto)}</a></td></tr>` : ""}<tr><td align="center" style="border-top:1px solid #dddcd9;padding:25px 0 16px;color:#49516b;font-size:14px;line-height:20px"><a href="${esc(sitio())}" style="color:#4a4fc1;font-size:15px;font-weight:bold">Sitio del CAPL</a> · <a href="${esc(`mailto:${contacto}`)}" style="color:#4a4fc1;font-size:15px;font-weight:bold">Contacto</a><p style="margin:16px 0 0;font-weight:bold">Unilasallista Corporación Universitaria</p><p style="margin:0">${esc(direccion)}</p><p style="margin:10px 0 0">Si necesitas ayuda ahora mismo, <a href="${esc(ayuda)}" style="color:#4a4fc1">entra aquí</a>.</p></td></tr></table></td></tr></table></td></tr></table></body>
</html>`;
  const texto = [
    e.asunto,
    ...(e.titulo && e.titulo !== e.asunto ? [e.titulo] : []),
    bajada,
    ...cuerpo,
    ...(e.fecha
      ? [
          e.fecha.rotulo,
          `${e.fecha.dia} ${e.fecha.mes} · ${e.fecha.hora} · ${e.fecha.linea}`,
        ]
      : []),
    ...(e.datos ?? []).map((d) => `${d.rotulo}: ${d.valor}`),
    ...(e.pie_datos ? [e.pie_datos] : []),
    ...(e.destacado ? [e.destacado] : []),
    ...(e.nota ? [e.nota.titulo, e.nota.texto] : []),
    ...(e.enlaces ?? []).map((l) => `${l.texto}: ${l.url}`),
    ...(e.archivoCalendario ? ["Archivo .ics adjunto"] : []),
    ...(e.boton ? [`${e.boton.texto}: ${url}`] : []),
    "—",
    `Sitio del CAPL: ${sitio()}`,
    "Unilasallista Corporación Universitaria",
    direccion,
    `Contacto: ${contacto}`,
    `Si necesitas ayuda ahora mismo: ${ayuda}`,
  ].join("\n");
  return { asunto: e.asunto, html, texto };
}

export function fechaCorreo(fecha: Date, rotulo: string, duracion?: number) {
  const formato = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("es-CO", { timeZone: ZONA, ...options }).format(
      fecha,
    );
  return {
    mes: formato({ month: "long" }),
    dia: formato({ day: "numeric" }),
    rotulo,
    hora: formatoHora(fecha),
    linea:
      formato({ weekday: "long" }).replace(/^./u, (letra) =>
        letra.toLocaleUpperCase("es-CO"),
      ) + (duracion === undefined ? "" : " \u00b7 " + duracion + " minutos"),
  };
}
