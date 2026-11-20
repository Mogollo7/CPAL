"use client";

import { Boton, BotonEnlace } from "@/componentes/atomos/boton";
import { EstadoPagina } from "@/componentes/organismos/estado-pagina";
import ilustracion from "@/contenido/ilustraciones/estado-error.webp";

export default function ErrorPublico({ reset }: { reset: () => void }) {
  return (
    <EstadoPagina
      titulo="Algo falló de nuestro lado"
      texto="Puedes volver a la página anterior o regresar al inicio."
      ilustracion={ilustracion}
    >
      <Boton onClick={reset}>Intentar de nuevo</Boton>
      <BotonEnlace href="/" tipo="borde">
        Volver al inicio
      </BotonEnlace>
    </EstadoPagina>
  );
}
