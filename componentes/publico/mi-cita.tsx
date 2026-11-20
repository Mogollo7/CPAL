"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, MapPin, User } from "lucide-react";
import { cn } from "@/componentes/cn";
import type { CitaPublica, EstadoCita } from "@/contratos/cita";
import { SIN_CONEXION } from "@/contratos/resultado";
import { cancelarCitaAccion, reprogramarCitaAccion } from "@/servidor/acciones";
import { formatoFechaHora } from "@/servidor/fechas";
import { SelectorCupo, type CambioCupo } from "./selector-cupo";

const ESTADOS: Record<
  EstadoCita,
  { nombre: string; texto: string; tono: string }
> = {
  PENDIENTE: {
    nombre: "Pendiente de confirmar",
    texto:
      "El equipo del CAPL revisará tu solicitud y te escribirá para confirmarla.",
    tono: "bg-aviso-fondo text-tinta",
  },
  AUTORIZADA: {
    nombre: "Confirmada",
    texto: "Te esperamos. Llega unos minutos antes.",
    tono: "bg-exito-fondo text-exito-texto",
  },
  RECHAZADA: {
    nombre: "No autorizada",
    texto:
      "No pudimos asignarte esta cita. Escríbenos y buscamos otra opción contigo.",
    tono: "bg-fondo-suave text-texto-secundario",
  },
  VENCIDA: {
    nombre: "Vencida",
    texto:
      "La solicitud no alcanzó a confirmarse a tiempo. Puedes pedir una nueva.",
    tono: "bg-fondo-suave text-texto-secundario",
  },
  CANCELADA: {
    nombre: "Cancelada",
    texto: "Esta cita está cancelada. Cuando quieras, puedes pedir una nueva.",
    tono: "bg-fondo-suave text-texto-secundario",
  },
  ATENDIDA: {
    nombre: "Atendida",
    texto:
      "Gracias por venir. Si quieres otra cita, puedes pedirla cuando quieras.",
    tono: "bg-exito-fondo text-exito-texto",
  },
  NO_ASISTIO: {
    nombre: "No asististe",
    texto:
      "No registramos tu asistencia. Si quieres otra cita, puedes pedirla.",
    tono: "bg-fondo-suave text-texto-secundario",
  },
};

const BOTON =
  "min-h-[48px] px-6 py-2.5 rounded-m font-medio text-p inline-flex items-center justify-center gap-2 focus-visible:outline-3 focus-visible:outline-foco disabled:opacity-50";
const PRINCIPAL = `${BOTON} bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo shadow-sm`;
const SECUNDARIO = `${BOTON} border border-borde-suave bg-fondo-superficie hover:bg-morado-50 text-texto-principal`;

/** /cita/[token] (RF-CIT-11, RF-CIT-13): ver la cita y, si está en plazo, cancelarla o reprogramarla. */
export function MiCita({ token, cita }: { token: string; cita: CitaPublica }) {
  const router = useRouter();
  const [vista, setVista] = useState<
    "detalle" | "confirmar-cancelar" | "reprogramar"
  >("detalle");
  const [elegido, setElegido] = useState<Required<CambioCupo>>({
    psicologoId: "",
    psicologoNombre: "",
    inicio: "",
  });
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const estado = ESTADOS[cita.estado];
  const activa = cita.estado === "PENDIENTE" || cita.estado === "AUTORIZADA";

  const ejecutar = async (accion: () => Promise<void>) => {
    setOcupado(true);
    setError(null);
    try {
      await accion();
    } catch {
      setError(SIN_CONEXION);
    } finally {
      setOcupado(false);
    }
  };

  const cancelar = () =>
    ejecutar(async () => {
      const r = await cancelarCitaAccion(token);
      if (!r.ok) return setError(r.mensaje);
      setVista("detalle");
      router.refresh(); // la página vuelve a leer la cita, ya cancelada
    });

  const reprogramar = () =>
    ejecutar(async () => {
      const r = await reprogramarCitaAccion({
        token,
        inicio: elegido.inicio,
        psicologoId: elegido.psicologoId || undefined,
      });
      if (r.ok) return router.push(r.datos.enlaceGestion); // la cita nueva tiene su propio enlace
      if (r.codigo === "CUPO_OCUPADO" || r.codigo === "FUERA_DE_RANGO") {
        setElegido((e) => ({ ...e, inicio: "" }));
        return setAviso(r.mensaje);
      }
      setError(r.mensaje);
    });

  return (
    <div className="mx-auto max-w-[720px] rounded-l border border-borde-suave bg-fondo-superficie p-6 sm:p-10 shadow-xs space-y-6">
      <div className="space-y-2">
        <span
          className={cn(
            "inline-block rounded-pildora px-3 py-1 text-caption font-medio",
            estado.tono,
          )}
        >
          {estado.nombre}
        </span>
        <h1 className="text-h1 font-fuerte text-texto-titulo">
          {cita.servicio}
        </h1>
        <p className="text-caption text-tinta-suave">
          Código <span className="font-mono font-fuerte">{cita.codigo}</span>
        </p>
      </div>

      <ul className="space-y-3 text-p text-texto-principal">
        <li className="flex gap-3">
          <CalendarClock
            className="w-5 h-5 text-morado-600 shrink-0"
            aria-hidden="true"
          />
          <span className="first-letter:uppercase">
            {formatoFechaHora(new Date(cita.inicio))}
          </span>
        </li>
        <li className="flex gap-3">
          <User
            className="w-5 h-5 text-morado-600 shrink-0"
            aria-hidden="true"
          />
          <span>{cita.psicologoNombre}</span>
        </li>
        <li className="flex gap-3">
          <MapPin
            className="w-5 h-5 text-morado-600 shrink-0"
            aria-hidden="true"
          />
          <span>{cita.lugar}</span>
        </li>
      </ul>

      <p className="text-p text-texto-secundario">{estado.texto}</p>

      {/* E09 §2: activa pero fuera de plazo → solo lectura con contactos. */}
      {activa && !cita.puedeCancelar && (
        <p className="rounded-m bg-crema border border-borde-suave p-4 text-caption">
          Falta muy poco para tu cita y ya no se puede cambiar desde aquí. Si no
          puedes asistir,{" "}
          <Link href="/contacto" className="text-texto-enlace underline">
            avísanos
          </Link>
          .
        </p>
      )}
      {cita.puedeCancelar && !cita.puedeReprogramar && (
        <p className="rounded-m bg-crema border border-borde-suave p-4 text-caption">
          Ya usaste las reprogramaciones permitidas. Aún puedes cancelarla.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="p-4 rounded-m bg-error-fondo text-error-texto text-caption font-medio"
        >
          {error}
        </p>
      )}

      {vista === "detalle" && (
        <div className="flex flex-wrap gap-3 pt-2 border-t border-borde-suave">
          {cita.puedeReprogramar && (
            <button
              type="button"
              className={PRINCIPAL}
              onClick={() => setVista("reprogramar")}
            >
              Cambiar fecha u hora
            </button>
          )}
          {cita.puedeCancelar && (
            <button
              type="button"
              className={SECUNDARIO}
              onClick={() => setVista("confirmar-cancelar")}
            >
              Cancelar cita
            </button>
          )}
          {!activa && (
            <Link href="/pedir-cita" className={PRINCIPAL}>
              Pedir una nueva cita
            </Link>
          )}
        </div>
      )}

      {vista === "confirmar-cancelar" && (
        <div
          role="alertdialog"
          aria-labelledby="titulo-cancelar"
          className="rounded-m border border-borde p-5 space-y-4"
        >
          <h2
            id="titulo-cancelar"
            className="text-h2 font-fuerte text-texto-titulo"
          >
            ¿Cancelar esta cita?
          </h2>
          <p className="text-p text-texto-secundario">
            El horario queda libre para otra persona. Si luego quieres atención,
            puedes pedir una cita nueva.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={PRINCIPAL}
              disabled={ocupado}
              onClick={cancelar}
            >
              {ocupado ? "Cancelando…" : "Sí, cancelar"}
            </button>
            <button
              type="button"
              className={SECUNDARIO}
              disabled={ocupado}
              onClick={() => setVista("detalle")}
            >
              No, mantenerla
            </button>
          </div>
        </div>
      )}

      {vista === "reprogramar" && (
        <div className="space-y-6 pt-2 border-t border-borde-suave">
          <h2 className="text-h2 font-fuerte text-texto-titulo">
            Elige el nuevo horario
          </h2>
          {aviso && (
            <p
              role="alert"
              className="p-4 rounded-m bg-aviso-fondo text-tinta text-caption"
            >
              {aviso}
            </p>
          )}
          <SelectorCupo
            servicioId={cita.servicioId}
            psicologoId={elegido.psicologoId}
            inicio={elegido.inicio}
            recargar={aviso ?? ""}
            alCambiar={(c) => setElegido((e) => ({ ...e, ...c }))}
          />
          {elegido.inicio && (
            // P-07: la cita anterior se cancela al confirmar.
            <p className="rounded-m bg-crema border border-borde-suave p-4 text-caption">
              Tu cita pasará al{" "}
              <strong>{formatoFechaHora(new Date(elegido.inicio))}</strong>. La
              cita actual se cancela y te llega un correo con el enlace nuevo.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={PRINCIPAL}
              disabled={!elegido.inicio || ocupado}
              onClick={reprogramar}
            >
              {ocupado ? "Guardando…" : "Confirmar nuevo horario"}
            </button>
            <button
              type="button"
              className={SECUNDARIO}
              disabled={ocupado}
              onClick={() => setVista("detalle")}
            >
              Volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
