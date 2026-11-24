import Image from "next/image";
import { FilaIlustrada } from "../moleculas/fila-ilustrada";
import { FondoGrano } from "../atomos/fondo-grano";
import { Titulo } from "../atomos/titulo";
import { EncabezadoSeccion } from "../moleculas/encabezado-seccion";
import ilustracionPedir from "@/contenido/ilustraciones/paso-pedir-cita.webp";
import ilustracionConfirmar from "@/contenido/ilustraciones/paso-confirmacion.webp";
import casaAmarilla from "@/contenido/ilustraciones/casa-amarilla.webp";

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
      className="relative isolate overflow-hidden pt-[clamp(4.25rem,14svh,9rem)] md:pt-seccion"
    >
      <div className="mx-auto max-w-[40rem] px-borde md:max-w-[988px] md:px-0">
        <EncabezadoSeccion
          id="titulo-pasos"
          titulo={titulo}
          bajada={bajada}
          className="max-md:text-center"
        />
      </div>

      <ol className="px-borde md:mt-cabecera">
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
            claseIlustracion="lg:-rotate-[10.5deg]"
          />
        </li>
      </ol>

      <div className="max-md:bloque-editorial relative isolate md:pt-entrada">
        <FondoGrano tono="lavanda" fundido="ambos" />
        <div className="mx-auto max-w-[40rem] px-borde text-center md:max-w-[660px] md:px-4">
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
          className="mx-auto mt-bloque h-auto w-full max-w-[70rem] md:-mt-5 md:max-w-none"
        />
      </div>
    </section>
  );
}
