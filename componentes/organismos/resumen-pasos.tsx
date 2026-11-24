import { BotonEnlace } from "../atomos/boton";
import { Titulo } from "../atomos/titulo";

const PASOS = [
  ["Elige un servicio", "Selecciona el servicio que necesitas."],
  ["Escoge tu horario", "Consulta la disponibilidad y elige un horario."],
  ["Completa tu solicitud", "Ingresa tus datos y envía el formulario."],
  ["Revisa tu correo", "Recibirás la información de tu cita por correo."],
] as const;

// Figma · Cómo agendar tu cita · resumen: línea de tiempo vertical (punto de 18 y trazo de 2 lavanda).
export function ResumenPasos() {
  return (
    <section
      aria-labelledby="titulo-resumen"
      className="mx-auto max-w-[700px] px-4 py-seccion"
    >
      <Titulo id="titulo-resumen">¿Cómo pido mi cita?</Titulo>
      <ol className="mt-bloque space-y-[60px] border-l-2 border-morado-300 pl-bloque">
        {PASOS.map(([titulo, texto]) => (
          <li key={titulo} className="relative space-y-2">
            <span
              aria-hidden="true"
              className="absolute top-[6px] -left-[52px] size-[18px] rounded-circulo bg-accion-fondo"
            />
            <h3 className="font-titulo text-subtitulo font-fuerte text-texto-titulo">
              {titulo}
            </h3>
            <p className="text-h2 text-texto-secundario">{texto}</p>
          </li>
        ))}
      </ol>
      <BotonEnlace href="/pedir-cita" className="mt-bloque">
        Agendar cita
      </BotonEnlace>
    </section>
  );
}
