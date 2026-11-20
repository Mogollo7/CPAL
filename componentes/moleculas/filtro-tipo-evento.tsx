import Link from "next/link";
import { TIPOS_EVENTO, ROTULO_TIPO, type TipoEvento } from "@/contratos/evento";
import { cn } from "../cn";

export function FiltroTipoEvento({ tipoActivo }: { tipoActivo?: string }) {
  const activoNormalizado = tipoActivo?.toUpperCase();
  const esActivo = (tipo?: TipoEvento) => {
    if (!tipo) {
      return (
        !activoNormalizado ||
        !(TIPOS_EVENTO as readonly string[]).includes(activoNormalizado)
      );
    }
    return activoNormalizado === tipo;
  };

  return (
    <nav
      aria-label="Filtro por tipo de evento"
      className="flex flex-wrap items-center gap-2"
    >
      <Link
        href="/eventos"
        aria-current={esActivo() ? "page" : undefined}
        className={cn(
          "inline-flex items-center rounded-pildora px-4 py-2 text-caption font-medio transition duration-(--mov-rapido) ease-entrada",
          esActivo()
            ? "bg-accion-fondo text-accion-texto shadow-flotante"
            : "border border-borde-suave bg-fondo-superficie text-texto-secundario hover:bg-fondo-suave hover:text-texto-principal",
        )}
      >
        Todos
      </Link>
      {TIPOS_EVENTO.map((t) => (
        <Link
          key={t}
          href={`/eventos?tipo=${t}`}
          aria-current={esActivo(t) ? "page" : undefined}
          className={cn(
            "inline-flex items-center rounded-pildora px-4 py-2 text-caption font-medio transition duration-(--mov-rapido) ease-entrada",
            esActivo(t)
              ? "bg-accion-fondo text-accion-texto shadow-flotante"
              : "border border-borde-suave bg-fondo-superficie text-texto-secundario hover:bg-fondo-suave hover:text-texto-principal",
          )}
        >
          {ROTULO_TIPO[t]}
        </Link>
      ))}
    </nav>
  );
}
