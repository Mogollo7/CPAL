import type { MetadataRoute } from "next";

// T-110 · Solo producción se abre a buscadores; local y pruebas bloquean todo (E07 "Buscadores").
// El panel y los enlaces con token nunca se indexan.
export default function robots(): MetadataRoute.Robots {
  const url = (process.env.URL_SITIO ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  if (process.env.ENTORNO !== "produccion")
    return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/panel",
        "/ingresar",
        "/crear-clave",
        "/recuperar-clave",
        "/cita/",
        "/api/",
      ],
    },
    sitemap: `${url}/sitemap.xml`,
  };
}
