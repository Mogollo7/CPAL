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
      <Titulo nivel="h1" tamano="bloque">
        {titulo}
      </Titulo>
      {descripcion && (
        <p className="mt-2 text-texto-secundario">{descripcion}</p>
      )}
      {pestana && (
        <nav aria-label="Perfil y cuenta" className="flex gap-2 mt-5">
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
