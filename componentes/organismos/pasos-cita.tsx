import Image from "next/image";
import { FilaIlustrada } from "../moleculas/fila-ilustrada";
import { FondoGrano } from "../atomos/fondo-grano";
import { Titulo } from "../atomos/titulo";
import { EncabezadoSeccion } from "../moleculas/encabezado-seccion";
import ilustracionPedir from "@/contenido/ilustraciones/paso-pedir-cita.webp";
import ilustracionConfirmar from "@/contenido/ilustraciones/paso-confirmacion.webp";
import casaAmarilla from "@/contenido/ilustraciones/casa-amarilla.webp";

// Cómo funciona en 3 pasos (Inicio): dos filas ilustradas seguidas (FilaIlustrada) y el tercer paso como
// sección de transición al estilo Duolingo: 140 de aire, título de 64 y el fondo lavanda que nace de la nada.
export function PasosCita({
  titulo = "pedir ayuda puede ser sencillo",
  bajada = "Tres pasos, sin filas y sin costo.",
}: {
  titulo?: string;
  bajada?: string;
}) {
  return (
    <section
      aria-labelledby="titulo-pasos"
      className="relative isolate overflow-hidden pt-seccion"
    >
      <div className="mx-auto max-w-[988px] px-4 sm:px-borde md:px-0">
        <EncabezadoSeccion id="titulo-pasos" titulo={titulo} bajada={bajada} />
      </div>

      <ol className="mt-cabecera px-4 sm:px-borde">
        <li>
          <FilaIlustrada
            nivel="h3"
            titulo="pide tu cita en línea"
            texto="Elige el servicio y el horario que prefieras. El proceso toma unos 5 minutos."
            ilustracion={ilustracionPedir}
          />
        </li>
        <li>
          <FilaIlustrada
            nivel="h3"
            invertida
            titulo="confirmamos tu espacio"
            texto="Revisamos tu solicitud y te escribimos al correo en máximo 48 horas."
            ilustracion={ilustracionConfirmar}
            claseIlustracion="-rotate-[10.5deg]"
          />
        </li>
      </ol>

      <div className="relative isolate pt-entrada">
        <FondoGrano tono="lavanda" fundido="ambos" />
        <div className="mx-auto max-w-[660px] px-4 text-center">
          <Titulo tamano="hero">asiste a tu sesión</Titulo>
          <p className="mt-[24px] text-h2 leading-titulo text-texto-secundario">
            Te esperamos en la casa amarilla, en Caldas, en el horario
            confirmado.
          </p>
        </div>
        <Image
          src={casaAmarilla}
          alt="La casa amarilla del CAPL en Caldas, Antioquia"
          sizes="100vw"
          className="-mt-5 w-full"
        />
      </div>
    </section>
  );
}
