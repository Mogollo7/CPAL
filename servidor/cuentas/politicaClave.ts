// Política de contraseña (E03 §7): mínimo 10 caracteres (lo valida el esquema), distinta del correo y fuera de la lista de comunes.
// SUPUESTO(P-xx): la lista de comunes es corta y local; ampliarla o cambiarla por una lista pública (p. ej. las 10 000 más usadas) si el CAPL lo pide.
const COMUNES = new Set([
  "1234567890",
  "12345678910",
  "0123456789",
  "contraseña",
  "contrasena1",
  "contrasena123",
  "password123",
  "password1234",
  "qwertyuiop",
  "qwerty12345",
  "1q2w3e4r5t",
  "abc1234567",
  "iloveyou123",
  "unilasallista",
  "lasallista123",
  "capl123456",
  "bienvenido1",
  "bienvenido123",
]);

/** Mensaje de error si la contraseña no sirve; `null` si sirve. */
export function errorDeClave(clave: string, correo: string): string | null {
  const c = clave.toLowerCase();
  if (c === correo.toLowerCase() || c === correo.split("@")[0].toLowerCase())
    return "La contraseña no puede ser tu correo.";
  if (COMUNES.has(c) || /^(.)\1+$/.test(c))
    return "Esa contraseña es demasiado común. Elige otra.";
  return null;
}
