import Link from "next/link";
import { Titulo } from "@/componentes/atomos/titulo";
import { claseBoton } from "@/componentes/atomos/boton";

export function EncabezadoPagina({
  titulo,
  descripcion,
  pestana,
}: {
  titulo: string;
  descripcion?: string;
  pestana?: "perfil" | "cuenta";
}) {
  return (
    <div>
      <p className="text-caption text-texto-secundario mb-4">
        Panel / {titulo === "Horario habitual" ? "Disponibilidad" : titulo}
      </p>
      <Titulo nivel="h1" tamano="h1" className="titulo-panel wrap-break-word">
        {titulo}
      </Titulo>
      {descripcion && (
        <p className="mt-2 max-w-[70ch] text-pretty text-texto-secundario">
          {descripcion}
        </p>
      )}
      {pestana && (
        <nav aria-label="Perfil y cuenta" className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/panel/psicologo/perfil"
            className={claseBoton(
              pestana === "perfil" ? "suave" : "borde",
              "border-0 shadow-none",
            )}
          >
            Perfil profesional
          </Link>
          <Link
            href="/panel/psicologo/cuenta"
            className={claseBoton(
              pestana === "cuenta" ? "suave" : "borde",
              "border-0 shadow-none",
            )}
          >
            Seguridad
          </Link>
        </nav>
      )}
    </div>
  );
}
