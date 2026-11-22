// Enlaces del sitio público (encabezado y pie). Módulo sin "use client" para que el pie (servidor) lo lea.
export const ENLACES_PUBLICOS = [
  { nombre: "Cómo funciona", ruta: "/como-funciona" },
  { nombre: "Servicios", ruta: "/servicios" },
  { nombre: "Equipo", ruta: "/equipo" },
  { nombre: "Eventos", ruta: "/eventos" },
  { nombre: "Contacto", ruta: "/contacto" },
] as const;
