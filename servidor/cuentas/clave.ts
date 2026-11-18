// Contraseñas con argon2id (S01). Parámetros por defecto de la librería = recomendación vigente de OWASP;
// el costo se revisa cada año (S08).
import { hash, verify } from "@node-rs/argon2";

export const hashClave = (clave: string) => hash(clave);

export const verificarClave = (claveHash: string, clave: string) =>
  verify(claveHash, clave).catch(() => false);

// Hash de relleno: cuando el correo no existe se verifica igual contra este, para que ingresar tarde lo mismo
// exista o no la cuenta (no se puede averiguar qué correos están registrados midiendo el tiempo).
const RELLENO = hash("relleno-para-igualar-tiempos");
export const verificarContraRelleno = async (clave: string) =>
  verify(await RELLENO, clave).catch(() => false);
