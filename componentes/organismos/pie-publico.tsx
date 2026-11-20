import Image from "next/image";
import Link from "next/link";
import { LogoCapl } from "../atomos/logo-capl";
import { ConsultarCita } from "../moleculas/consultar-cita";
import { ENLACES_PUBLICOS } from "./navegacion";
import logoUnilasallista from "@/contenido/marca/logo-unilasallista-blanco.webp";

async function anioActual() {
  "use cache";
  return new Date().getFullYear();
}

const CONTACTO = [
  ["WhatsApp · 310 209 6266", "https://wa.me/573102096266"],
  ["capl@unilasallista.edu.co", "mailto:capl@unilasallista.edu.co"],
  [
    "Instagram · @cap_unilasallista",
    "https://www.instagram.com/cap_unilasallista/",
  ],
  ["Instagram · @unilasallista", "https://www.instagram.com/unilasallista/"],
  [
    "Sitio oficial del centro",
    "https://www.unilasallista.edu.co/centro-de-atencion-psicologica/",
  ],
] as const;

const TITULO_COLUMNA = "text-h2 font-medio";
const ENLACE = "rounded-s hover:underline underline-offset-4";

// Figma · Organismos/Pie de página: curva morada de 102 sobre la página y cuatro columnas (42 · 335 · 600 · 885).
export async function PiePublico() {
  return (
    <footer className="relative isolate text-blanco">
      <svg
        aria-hidden="true"
        viewBox="0 0 1280 103"
        preserveAspectRatio="none"
        className="-mb-px block h-[103px] w-full fill-morado-600"
      >
        <path d="M0 51.6C235-6.4 403-10.4 646 14.6c274 29 413 32 634-6V103H0Z" />
      </svg>
      <div className="bg-morado-600 px-4 pb-bloque pt-5 sm:px-borde">
        <div className="mx-auto grid max-w-[1196px] gap-bloque md:grid-cols-[1.25fr_1fr_1fr_1.3fr] md:justify-items-start">
          <div className="space-y-4">
            <LogoCapl fondo="oscuro" />
            <p>
              Casa amarilla · Caldas, Antioquia
              <br />
              Carrera 51 # 118 Sur – 57
            </p>
          </div>
          <nav aria-label="Pie" className="flex flex-col gap-2">
            <h2 className={TITULO_COLUMNA}>Navega</h2>
            {ENLACES_PUBLICOS.map((e) => (
              <Link key={e.ruta} href={e.ruta} className={ENLACE}>
                {e.nombre}
              </Link>
            ))}
            <Link href="/ingresar" className={ENLACE}>
              Ingreso del equipo
            </Link>
          </nav>
          <div className="flex flex-col gap-2">
            <h2 className={TITULO_COLUMNA}>Ayuda ahora</h2>
            <a href="tel:123" className={ENLACE}>
              Emergencias · 123
            </a>
            <a
              href="https://minsalud.gov.co/salud/publica/salud-mental/Paginas/linea-106.aspx"
              target="_blank"
              rel="noreferrer"
              className={ENLACE}
            >
              Línea de salud mental
            </a>
            <Link href="/ayuda-inmediata" className={ENLACE}>
              Guía de ayuda inmediata
            </Link>
          </div>
          <div className="space-y-5">
            <ConsultarCita />
            <div className="flex flex-col gap-1">
              <h2 className={TITULO_COLUMNA}>Contacto</h2>
              {CONTACTO.map(([texto, href]) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={ENLACE}
                >
                  {texto}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-bloque flex max-w-[1196px] flex-col items-center gap-4 text-center text-caption">
          <div className="space-y-1">
            <p>
              © {await anioActual()} CAPL · Unilasallista Corporación
              Universitaria
            </p>
            <p className="flex flex-wrap justify-center gap-5 text-caption font-medio">
              <Link href="/privacidad" className={ENLACE}>
                Política de tratamiento de datos
              </Link>
              <Link href="/terminos" className={ENLACE}>
                Términos y condiciones
              </Link>
            </p>
          </div>
          <Image
            src={logoUnilasallista}
            alt="Unilasallista"
            className="h-[31px] w-auto"
            sizes="160px"
          />
        </div>
      </div>
    </footer>
  );
}
