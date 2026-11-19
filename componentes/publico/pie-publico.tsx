import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  FileText,
  LifeBuoy,
} from "lucide-react";
import logoUnilasallistaBlanco from "@/contenido/marca/logo-unilasallista-blanco.png";

export function PiePublico() {
  return (
    <footer className="w-full bg-morado-900 text-blanco border-t border-morado-700">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Columna 1: Identidad institucional */}
          <div className="space-y-4">
            <div className="relative h-12 w-48 shrink-0">
              <Image
                src={logoUnilasallistaBlanco}
                alt="Logo Unilasallista"
                fill
                sizes="192px"
                className="object-contain object-left"
              />
            </div>
            <p className="font-fuerte text-p tracking-tight">
              CAPL · Centro de Atención Psicológica Lasallista
            </p>
            <p className="text-caption text-morado-100 leading-texto">
              Espacio universitario de escucha, acompañamiento y bienestar
              emocional atendido por profesionales en formación bajo supervisión
              docente especializada.
            </p>
          </div>

          {/* Columna 2: Horarios de atención */}
          <div className="space-y-4">
            <h3 className="font-fuerte text-p text-amarillo-300 flex items-center gap-2">
              <Clock className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>Horarios de atención</span>
            </h3>
            <div className="text-caption text-morado-100 space-y-2">
              <p className="font-medio text-blanco">
                Lunes a viernes: 8:00 a. m. – 5:00 p. m.
              </p>
              <p className="text-tinta-suave text-morado-300 italic">
                * Horario de referencia institucional. Sujeto a confirmación
                oficial y disponibilidad de citas.
              </p>
              <div className="pt-2">
                <Link
                  href="/ayuda-inmediata"
                  className="inline-flex items-center gap-1.5 text-amarillo-300 hover:text-amarillo-100 font-medio underline decoration-1 underline-offset-2 focus-visible:outline-2 focus-visible:outline-amarillo-500 rounded-s"
                >
                  <LifeBuoy className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>¿Fuera de horario? Consulta líneas 24/7</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Columna 3: Ubicación y contacto */}
          <div className="space-y-4">
            <h3 className="font-fuerte text-p text-amarillo-300 flex items-center gap-2">
              <MapPin className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>Ubicación y contacto</span>
            </h3>
            <ul className="text-caption text-morado-100 space-y-2.5">
              <li className="flex items-start gap-2">
                <MapPin
                  className="w-4 h-4 shrink-0 mt-0.5 text-morado-300"
                  aria-hidden="true"
                />
                <span>Campus Unilasallista · Caldas, Antioquia, Colombia</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail
                  className="w-4 h-4 shrink-0 text-morado-300"
                  aria-hidden="true"
                />
                <a
                  href="mailto:capl@unilasallista.edu.co"
                  className="hover:text-amarillo-300 underline decoration-1 underline-offset-2 focus-visible:outline-2 focus-visible:outline-amarillo-500 rounded-s"
                >
                  capl@unilasallista.edu.co
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone
                  className="w-4 h-4 shrink-0 text-morado-300"
                  aria-hidden="true"
                />
                <span>Conmutador: (604) 320 19 99</span>
              </li>
            </ul>
          </div>

          {/* Columna 4: Redes sociales y navegación rápida */}
          <div className="space-y-4">
            <h3 className="font-fuerte text-p text-amarillo-300">
              Conéctate con nosotros
            </h3>
            <p className="text-caption text-morado-100">
              Sigue las actividades de bienestar, talleres y salud mental de
              Unilasallista:
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.instagram.com/unilasallista"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram oficial de Unilasallista (abre en ventana nueva)"
                className="min-h-[48px] min-w-[48px] rounded-m bg-morado-700 hover:bg-morado-600 inline-flex items-center justify-center text-blanco transition-colors duration-mov-rapido focus-visible:outline-2 focus-visible:outline-amarillo-500"
              >
                <span className="font-fuerte text-caption">IG</span>
              </a>
              <a
                href="https://www.facebook.com/unilasallista"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook oficial de Unilasallista (abre en ventana nueva)"
                className="min-h-[48px] min-w-[48px] rounded-m bg-morado-700 hover:bg-morado-600 inline-flex items-center justify-center text-blanco transition-colors duration-mov-rapido focus-visible:outline-2 focus-visible:outline-amarillo-500"
              >
                <span className="font-fuerte text-caption">FB</span>
              </a>
              <a
                href="https://www.youtube.com/unilasallista"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube oficial de Unilasallista (abre en ventana nueva)"
                className="min-h-[48px] min-w-[48px] rounded-m bg-morado-700 hover:bg-morado-600 inline-flex items-center justify-center text-blanco transition-colors duration-mov-rapido focus-visible:outline-2 focus-visible:outline-amarillo-500"
              >
                <span className="font-fuerte text-caption">YT</span>
              </a>
            </div>
          </div>
        </div>

        {/* Barra inferior: Términos, Política de datos y Derechos */}
        <div className="mt-12 pt-8 border-t border-morado-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-caption text-morado-100">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} Centro de Atención Psicológica
            Lasallista (CAPL). Todos los derechos reservados.
          </p>

          <nav
            aria-label="Enlaces legales y de privacidad"
            className="flex items-center gap-4 flex-wrap justify-center"
          >
            <Link
              href="/politica-datos"
              className="hover:text-amarillo-300 underline decoration-1 underline-offset-2 inline-flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-amarillo-500 rounded-s"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>Política de datos</span>
            </Link>
            <span>·</span>
            <Link
              href="/terminos"
              className="hover:text-amarillo-300 underline decoration-1 underline-offset-2 inline-flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-amarillo-500 rounded-s"
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>Términos y condiciones</span>
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
