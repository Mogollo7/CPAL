import { BotonEnlace } from "@/componentes/atomos/boton";
import { EstadoPagina } from "@/componentes/organismos/estado-pagina";
import PlantillaPublica from "./(publico)/layout";
import ilustracion from "@/contenido/ilustraciones/estado-404.webp";

// Raíz: también atrapa rutas que no existen fuera de (publico); por eso monta la plantilla pública.
export default function NoEncontrada() {
  return (
    <PlantillaPublica>
      <EstadoPagina
        titulo="No encontramos esta página"
        texto="Puede que el enlace haya cambiado. Puedes volver al inicio o contactar al CAPL."
        ilustracion={ilustracion}
      >
        <BotonEnlace href="/">Volver al inicio</BotonEnlace>
        <BotonEnlace href="/contacto" tipo="borde">
          Contactar al CAPL
        </BotonEnlace>
      </EstadoPagina>
    </PlantillaPublica>
  );
}
