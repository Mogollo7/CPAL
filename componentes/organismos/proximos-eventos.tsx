import type { EventoDetalle } from "@/contratos/evento";
import { BotonEnlace } from "../atomos/boton";
import { Seccion } from "../atomos/seccion";
import { EncabezadoSeccion } from "../moleculas/encabezado-seccion";
import { TarjetaTaller } from "../moleculas/tarjeta-taller";

const TINTES = ["morado", "agua", "amarillo"] as const;

// Figma · Próximos eventos (Inicio): tres tarjetas de 350 × 420 separadas 30 y «Ver agenda». Datos por props.
export function ProximosEventos({ eventos }: { eventos: EventoDetalle[] }) {
  if (eventos.length === 0) return null;
  return (
    <Seccion aria-labelledby="titulo-eventos">
      <div className="mx-auto max-w-[1110px] space-y-bloque">
        <EncabezadoSeccion
          id="titulo-eventos"
          titulo="próximos eventos"
          bajada="Encuentros para aprender, compartir y cuidar de ti."
          centrado
        />
        <ul className="grid gap-[30px] sm:grid-cols-2 md:grid-cols-3">
          {eventos.slice(0, 3).map((e, i) => (
            <li key={e.id}>
              <TarjetaTaller
                href={`/eventos/${e.slug}`}
                etiqueta="Taller"
                titulo={e.titulo}
                resumen={e.descripcion.split("\n")[0]}
                imagen={e.imagenUrl}
                tinte={TINTES[i % TINTES.length]}
              />
            </li>
          ))}
        </ul>
        <div className="text-center">
          <BotonEnlace href="/eventos">Ver agenda</BotonEnlace>
        </div>
      </div>
    </Seccion>
  );
}
