import type { MetadataRoute } from "next";

// T-110 · Solo páginas públicas estáticas. `/eventos/[slug]` se añadirá cuando exista `listarEventosPublicos`.
const RUTAS = [
  "/",
  "/como-funciona",
  "/servicios",
  "/equipo",
  "/eventos",
  "/ayuda-inmediata",
  "/preguntas-frecuentes",
  "/contacto",
  "/pedir-cita",
  "/privacidad",
  "/terminos",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (process.env.URL_SITIO ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  if (process.env.ENTORNO !== "produccion") return []; // pruebas: nada que indexar
  return RUTAS.map((ruta) => ({ url: url + ruta }));
}
