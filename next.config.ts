import type { NextConfig } from "next";

// Cabeceras de seguridad (S01 · Transporte y cabeceras, RNF-SEG-14).
// SUPUESTO(P-19): HSTS de un año sin `preload` ni `includeSubDomains` hasta conocer el subdominio oficial.
// ponytail: Next inyecta scripts en línea para hidratar, y la marca de un solo uso (nonce) exige generar la CSP en
// `proxy.ts`. Mientras tanto `script-src` admite 'unsafe-inline'; cuando proxy.ts emita el nonce, quitarlo de aquí.
const desarrollo = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${desarrollo ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'", // Tailwind/Next inyectan estilos en línea
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(desarrollo ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const cabecerasSeguras = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "X-Frame-Options", value: "DENY" }, // refuerzo para navegadores sin frame-ancestors
  ...(desarrollo
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000",
        },
      ]),
];

const sinCache = [{ key: "Cache-Control", value: "no-store" }];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Salida mínima para la imagen de Docker (la activa el Dockerfile); `npm start` en local sigue igual.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  async headers() {
    return [
      { source: "/:path*", headers: cabecerasSeguras },
      // S01 · Caché: el panel, la cita y el acceso nunca se guardan en el navegador ni en intermediarios.
      { source: "/panel/:path*", headers: sinCache },
      { source: "/cita/:path*", headers: sinCache },
      { source: "/ingresar", headers: sinCache },
      { source: "/crear-clave/:path*", headers: sinCache },
      { source: "/recuperar-clave", headers: sinCache },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
