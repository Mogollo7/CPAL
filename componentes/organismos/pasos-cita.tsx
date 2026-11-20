import Image from "next/image";
import { FondoGrano } from "../atomos/fondo-grano";
import { Titulo } from "../atomos/titulo";
import { EncabezadoSeccion } from "../moleculas/encabezado-seccion";
import ilustracionPedir from "@/contenido/ilustraciones/paso-pedir-cita.webp";
import ilustracionConfirmar from "@/contenido/ilustraciones/paso-confirmacion.webp";
import casaAmarilla from "@/contenido/ilustraciones/casa-amarilla.webp";

function Paso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="max-w-[430px] space-y-4">
      <Titulo nivel="h3" tamano="h1">
        {titulo}
      </Titulo>
      <p className="text-h2 leading-titulo text-texto-secundario">{texto}</p>
    </div>
  );
}

// Figma · Cómo funciona en 3 pasos (Inicio y Servicios): dos pasos en zigzag con ilustración de 400
// y el tercero sobre la casa amarilla, con fondo lavanda con grano que se funde arriba y abajo.
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
      <div className="mx-auto max-w-lectura px-4 sm:px-borde md:px-0">
        <EncabezadoSeccion id="titulo-pasos" titulo={titulo} bajada={bajada} />
      </div>

      <ol className="mx-auto mt-cabecera grid max-w-[880px] gap-bloque px-4 sm:px-borde md:px-0">
        <li className="grid items-center gap-5 md:grid-cols-[430px_1fr]">
          <Paso
            titulo="pide tu cita en línea"
            texto="Elige el servicio y el horario que prefieras. El proceso toma unos 5 minutos."
          />
          <Image
            src={ilustracionPedir}
            alt=""
            sizes="400px"
            className="mx-auto w-[400px]"
          />
        </li>
        <li className="grid items-center gap-5 md:grid-cols-[1fr_430px]">
          <Image
            src={ilustracionConfirmar}
            alt=""
            sizes="400px"
            className="mx-auto w-[400px] -rotate-[10.5deg] max-md:order-last"
          />
          <Paso
            titulo="confirmamos tu espacio"
            texto="Revisamos tu solicitud y te escribimos al correo en máximo 48 horas."
          />
        </li>
      </ol>

      <div className="relative isolate mt-bloque pt-[220px]">
        <FondoGrano tono="lavanda" fundido="ambos" />
        <div className="mx-auto max-w-[660px] px-4 text-center">
          <EncabezadoSeccion
            titulo="asiste a tu sesión"
            bajada="Te esperamos en la casa amarilla, en Caldas, en el horario confirmado."
            centrado
          />
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
