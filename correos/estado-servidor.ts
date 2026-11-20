import type { InformeEstado } from "../contratos/informe-estado";
import { ZONA } from "../servidor/fechas";
import { esc, type CorreoRender } from "./base";

// Informe diario para administración (Figma: «estado-del-servidor · Informe de ingeniería»). Solo cifras, sin botón por
// persona: un único «Ver monitoreo». No lleva la línea de ayuda inmediata (es un informe interno).
export type Datos = InformeEstado;

const sitio = () => (process.env.URL_SITIO ?? "").replace(/\/$/, "");
const f = (d: Date, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("es-CO", { timeZone: ZONA, ...o }).format(d);
const hora = (d: Date) =>
  f(d, { hour: "2-digit", minute: "2-digit", hour12: false });
const num = (n: number) => new Intl.NumberFormat("es-CO").format(n);
const corto = (d: Date) =>
  `${f(d, { day: "numeric", month: "short" })}, ${hora(d)}`;

export function render(d: Datos): CorreoRender {
  const desde = new Date(d.desde);
  const hasta = new Date(d.hasta);
  const ultimo = d.ultimoSondeo ? new Date(d.ultimoSondeo) : null;
  const activo = !!ultimo && hasta.getTime() - ultimo.getTime() <= 5 * 60_000; // respondió en los últimos 5 minutos
  const titulo =
    d.disponibilidad === null
      ? "Sin datos todavía"
      : activo
        ? "Servidor operativo"
        : "Servidor sin respuesta";
  const comprobacion = ultimo
    ? `Última comprobación a las ${hora(ultimo)} del ${f(ultimo, { day: "numeric", month: "long" })}.`
    : "Aún no hay comprobaciones registradas.";
  const ventana = `${corto(desde)} – ${corto(hasta)} de ${f(hasta, { year: "numeric" })} · Hora de Colombia`;
  const disponibilidad =
    d.disponibilidad === null
      ? "—"
      : `${new Intl.NumberFormat("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(d.disponibilidad)} %`;
  const incidente = d.incidente
    ? {
        titulo: `${hora(new Date(d.incidente.desde))} – ${hora(new Date(d.incidente.hasta))} · Interrupción resuelta`,
        detalle: `El servicio dejó de responder y volvió a responder a las ${hora(new Date(d.incidente.hasta))}.`,
      }
    : {
        titulo: "Sin interrupciones",
        detalle: "No hubo interrupciones de 2 minutos o más en este periodo.",
      };

  const cifra = (valor: string, rotulo: string) =>
    `<td width="33%" valign="top" style="padding-right:12px"><div style="font-size:29px;line-height:36px;font-weight:bold;color:#1d2853">${esc(valor)}</div><div style="font-size:15px;line-height:19px;color:#4c536b">${esc(rotulo)}</div></td>`;
  const tarjeta = (nombre: string, cifras: [string, string][], extra: string) =>
    `<tr><td style="padding-top:15px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px"><tr><td style="padding:24px"><div style="font-size:22px;line-height:27px;font-weight:bold;color:#1d2853;padding-bottom:15px">${esc(nombre)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cifras.map(([v, r]) => cifra(v, r)).join("")}</tr></table>${extra}</td></tr></table></td></tr>`;
  const nota = (t: string) =>
    `<div style="font-size:16px;line-height:20px;color:#4c536b;padding-top:15px">${esc(t)}</div>`;
  const c = d.correos;
  const s = d.seguridad;

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap" rel="stylesheet"></head>
<body style="margin:0;background:#faf9f6;font-family:Nunito,Arial,sans-serif;color:#1c2956"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#faf9f6;border-radius:12px"><tr><td style="padding:4px 32px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td height="84"><img src="${esc(`${sitio()}/correos/logo-capl.png`)}" width="106" height="106" alt="" style="display:block;width:106px;height:auto;max-height:84px;object-fit:contain"></td><td align="right" style="font-size:14px;line-height:17px;font-weight:bold;color:#49516b">Centro de Atención<br>Psicológica Lasallista</td></tr></table></td></tr>
<tr><td style="background:#e6f4ee;border-radius:16px;padding:24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="176" valign="middle" style="width:176px;padding-right:20px"><img src="${esc(`${sitio()}/correos/gato-soporte.png`)}" width="176" height="187" alt="" style="display:block;width:176px;height:auto;max-width:100%"></td><td valign="middle"><div style="font-size:13px;line-height:16px;font-weight:bold;color:#246659">INFORME DIARIO · PRODUCCIÓN</div><h1 style="margin:9px 0 0;font-size:31px;line-height:38px;font-weight:bold;color:#1d2853">${esc(titulo)}</h1><p style="margin:9px 0 0;font-size:16px;line-height:20px;color:#4c536b">${esc(comprobacion)}</p></td></tr></table></td></tr>
<tr><td align="center" style="padding-top:15px;font-size:15px;line-height:19px;font-weight:bold;color:#4c536b">${esc(ventana)}</td></tr>
${tarjeta(
  "Disponibilidad del servidor",
  [
    [disponibilidad, "Disponibilidad"],
    [`${num(d.minutosSinServicio)} min`, "Sin servicio"],
    [
      d.latenciaP95Ms === null ? "—" : `${num(d.latenciaP95Ms)} ms`,
      "Latencia p95",
    ],
  ],
  `<div style="background:#fbf1df;border-radius:10px;padding:16px;margin-top:15px"><div style="font-size:18px;line-height:22px;font-weight:bold;color:#844b1e">${esc(incidente.titulo)}</div><div style="font-size:16px;line-height:20px;color:#4c536b;padding-top:6px">${esc(incidente.detalle)}</div></div>`,
)}
${tarjeta(
  "Envío de correos · Resend",
  [
    [num(c.enviados), "Enviados"],
    [num(c.entregados), "Entregados"],
    [num(c.rebotados), "Rebotados"],
  ],
  nota(
    `${num(c.pendientes)} pendientes de entrega · ${num(c.errores)} errores de envío`,
  ),
)}
${tarjeta(
  "Ingresos y seguridad",
  [
    [num(s.ingresosCorrectos), "Ingresos correctos"],
    [num(s.intentosFallidos), "Intentos fallidos"],
    [num(s.cuentasBloqueadas), "Cuentas bloqueadas"],
  ],
  nota(
    `${num(s.accesosEmergencia)} accesos de emergencia · ${num(s.administradoresCreados)} cuentas administradoras creadas`,
  ),
)}
<tr><td align="center" style="padding:15px 0"><a href="${esc(`${sitio()}/panel/admin/correos`)}" style="display:inline-block;box-sizing:border-box;width:236px;padding:15px 8px;line-height:20px;background:#4a4fc1;color:#fff;text-decoration:none;font-size:17px;font-weight:bold;border-radius:9999px">Ver monitoreo</a></td></tr>
<tr><td align="center" style="border-top:1px solid #dddcd9;padding:25px 0 16px;color:#49516b;font-size:14px;line-height:20px"><a href="${esc(sitio())}" style="color:#4a4fc1;font-size:15px;font-weight:bold">Sitio del CAPL</a> · <a href="mailto:${esc(process.env.CORREO_RESPUESTA ?? "")}" style="color:#4a4fc1;font-size:15px;font-weight:bold">Contacto</a><p style="margin:16px 0 0;font-weight:bold">Unilasallista Corporación Universitaria</p><p style="margin:0">Casa amarilla del CAPL · Caldas, Antioquia</p></td></tr></table></td></tr></table></td></tr></table></body>
</html>`;

  const texto = [
    `Informe diario del servidor · ${titulo}`,
    comprobacion,
    ventana,
    "",
    `Disponibilidad: ${disponibilidad} · Sin servicio: ${d.minutosSinServicio} min · Latencia p95: ${d.latenciaP95Ms ?? "—"} ms`,
    `${incidente.titulo}. ${incidente.detalle}`,
    "",
    `Correos: ${c.enviados} enviados · ${c.entregados} entregados · ${c.rebotados} rebotados · ${c.pendientes} pendientes · ${c.errores} errores`,
    `Ingresos: ${s.ingresosCorrectos} correctos · ${s.intentosFallidos} fallidos · ${s.cuentasBloqueadas} cuentas bloqueadas · ${s.accesosEmergencia} accesos de emergencia · ${s.administradoresCreados} administradores creados`,
    "",
    `Ver monitoreo: ${sitio()}/panel/admin/correos`,
  ].join("\n");

  return { asunto: "Informe diario del servidor · CAPL", html, texto };
}

export const ejemplo: Datos = {
  desde: "2026-11-18T13:00:00.000Z",
  hasta: "2026-11-19T13:00:00.000Z",
  disponibilidad: 99.72,
  minutosSinServicio: 4,
  latenciaP95Ms: 185,
  ultimoSondeo: "2026-11-19T12:59:00.000Z",
  incidente: {
    desde: "2026-11-19T11:14:00.000Z",
    hasta: "2026-11-19T11:18:00.000Z",
  },
  correos: {
    enviados: 248,
    entregados: 245,
    rebotados: 2,
    pendientes: 1,
    errores: 0,
  },
  seguridad: {
    ingresosCorrectos: 86,
    intentosFallidos: 7,
    cuentasBloqueadas: 1,
    accesosEmergencia: 0,
    administradoresCreados: 0,
  },
};
