import { notFound, redirect } from "next/navigation";
import type { Resultado } from "../contratos/resultado";

/** Para páginas de servidor: los datos de la operación, o la salida que corresponde al fallo.
 *  Cualquier otro fallo (p. ej. base caída) se lanza para que lo muestre la página de error, nunca datos inventados. */
export function datosDePagina<T>(r: Resultado<T>): T {
  if (r.ok) return r.datos;
  if (r.codigo === "NO_ENCONTRADO") notFound();
  if (r.codigo === "NO_AUTENTICADO") redirect("/ingresar");
  if (r.codigo === "SIN_PERMISO") redirect("/panel?error=sin-permiso");
  throw new Error(r.mensaje);
}
