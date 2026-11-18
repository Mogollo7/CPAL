// Datos fijos del centro y rutas a las que apuntan los botones de los correos. Un solo lugar para cambiarlos.
// Las rutas son relativas: `plantillaBase` las completa con URL_SITIO (RES-TEC-05).

// SUPUESTO(P-22/CAPL): dirección y teléfono reales aún no confirmados; se toman del entorno y, si faltan, un marcador.
export const centro = () => ({
  direccion:
    process.env.CAPL_DIRECCION ||
    "Casa amarilla del CAPL (dirección por confirmar)",
  telefono: process.env.CAPL_TELEFONO || "(teléfono por confirmar)",
});

// SUPUESTO: rutas del panel y de seguridad por confirmar con quien construya las pantallas (E04).
export const RUTAS = {
  panelCita: (citaId: string) => `/panel/citas/${citaId}`,
  agenda: "/panel/agenda",
  pedirCita: "/pedir-cita",
  crearClave: (token: string) => `/crear-clave/${token}`,
  evento: (slug: string) => `/eventos/${slug}`,
  cerrarSesiones: "/panel/seguridad",
};

/** Dominio de URL_SITIO, para el UID del .ics. */
export const dominio = () => {
  try {
    return new URL(process.env.URL_SITIO ?? "").host || "capl";
  } catch {
    return "capl";
  }
};

export const enlaceAbsoluto = (ruta: string) =>
  `${(process.env.URL_SITIO ?? "").replace(/\/$/, "")}${ruta}`;
