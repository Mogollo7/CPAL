// Guarda de entrada del panel (RF-AUT-05/07). Corre antes de renderizar /panel/**:
//  · sin cookie válida o vencida por inactividad → /ingresar
//  · cookie válida → renueva el plazo de inactividad (2 h admin / 8 h psicólogo)
// Aquí NO se consulta la base de datos: que el usuario siga activo y su rol se comprueban en cada página con
// `paginaProtegida()` / en cada operación con `exigir()`. Esta capa solo evita renderizar sin sesión.
import { NextResponse, type NextRequest } from "next/server";
import { rutaPermitida } from "./servidor/permisos";
import {
  COOKIE_SESION,
  firmar,
  leer,
  opcionesCookie,
  renovada,
} from "./servidor/cuentas/sesion";

export function proxy(req: NextRequest) {
  const carga = leer(req.cookies.get(COOKIE_SESION)?.value);
  if (!carga) {
    const destino = new URL("/ingresar", req.url);
    destino.searchParams.set("siguiente", req.nextUrl.pathname);
    const res = NextResponse.redirect(destino);
    if (req.cookies.has(COOKIE_SESION)) res.cookies.delete(COOKIE_SESION); // vencida o alterada
    return res;
  }
  // Rol que no corresponde a la ruta (p. ej. psicólogo en /panel/admin): SIN_PERMISO, igual que `paginaProtegida`.
  if (!rutaPermitida(req.nextUrl.pathname, carga.r))
    return NextResponse.redirect(new URL("/panel?error=sin-permiso", req.url));
  const res = NextResponse.next();
  const nueva = renovada(carga);
  if (nueva)
    res.cookies.set(COOKIE_SESION, firmar(nueva), opcionesCookie(nueva.r));
  return res;
}

export const config = { matcher: "/panel/:path*" };
