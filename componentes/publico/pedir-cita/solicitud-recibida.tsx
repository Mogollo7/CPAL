import Link from "next/link";
import { Clock, Home } from "lucide-react";
import Image from "next/image";
import { claseBoton } from "@/componentes/atomos/boton";
import { Titulo } from "@/componentes/atomos/titulo";
import calendario from "@/contenido/ilustraciones/cita-calendario.webp";
import type { CitaCreada } from "@/contratos/cita";
import { formatoFechaHora } from "@/servidor/fechas";

export function SolicitudRecibida({
  cita,
  correo,
}: {
  cita: CitaCreada;
  correo: string;
}) {
  // Con auto-autorización (configuración del centro) la cita sale ya AUTORIZADA.
  const autorizada = cita.estado === "AUTORIZADA";
  return (
    <div className="text-center space-y-6 py-6 sm:py-8">
      <Image
        src={calendario}
        alt=""
        sizes="(max-width: 335px) calc(100vw - 32px), 304px"
        className="mx-auto w-full max-w-[304px]"
      />

      <div className="space-y-2 max-w-[65ch] mx-auto">
        <Titulo nivel="h2" tamano="h1">
          {autorizada
            ? "¡Tu cita quedó confirmada!"
            : "¡Recibimos tu solicitud de cita!"}
        </Titulo>
        <p className="text-p text-texto-secundario leading-texto">
          {autorizada
            ? `Te esperamos el ${formatoFechaHora(new Date(cita.inicio))}.`
            : "Nuestro equipo la revisará y te escribirá para confirmarla."}
        </p>
      </div>

      <div className="p-6 rounded-m bg-fondo-suave border border-borde-suave max-w-[500px] mx-auto space-y-2">
        <span className="text-caption text-texto-secundario block">
          Código de tu solicitud
        </span>
        <span className="font-fuerte text-h1 text-texto-titulo tracking-wider block font-mono">
          {cita.codigo}
        </span>
      </div>

      <div className="max-w-[600px] mx-auto text-left rounded-m bg-fondo-suave border border-borde-suave p-6 space-y-3">
        <h3 className="font-fuerte text-p text-texto-titulo flex items-center gap-2">
          <Clock className="w-5 h-5 text-texto-enlace" aria-hidden="true" />
          <span>¿Qué sigue?</span>
        </h3>
        <ul className="space-y-2 text-p text-texto-principal list-disc pl-5">
          <li>
            Te llegará un correo a <strong>{correo}</strong> con el enlace para
            ver, cancelar o reprogramar tu cita.
          </li>
          <li>Te esperamos en la Casa Amarilla de Unilasallista (Caldas).</li>
        </ul>
      </div>

      <div className="pt-4 flex flex-wrap justify-center gap-4">
        <Link href="/" className={claseBoton("principal")}>
          <Home className="w-5 h-5" aria-hidden="true" />
          <span>Volver al inicio</span>
        </Link>
      </div>
    </div>
  );
}
