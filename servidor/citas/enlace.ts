// Enlace para gestionar una cita sin cuenta (E03 §6): `/cita/{id}.{firma}`. La firma vive en `servidor/correo/enlaces.ts`
// para que los correos y las pantallas coincidan; aquí solo se le dan los nombres que usa el núcleo de citas.
import { citaDeEnlace, firmaCita, rutaCita } from "../correo/enlaces";

export const tokenDeCita = (id: string) => `${id}.${firmaCita(id)}`;
/** Ruta relativa; los correos la unen con URL_SITIO. */
export const enlaceDeCita = rutaCita;
/** Devuelve el id si la firma coincide; `null` si el token está mal formado o alterado. */
export const idDeToken = citaDeEnlace;
