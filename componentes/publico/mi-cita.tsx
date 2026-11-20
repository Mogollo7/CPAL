"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Boton, BotonEnlace, claseBoton } from "@/componentes/atomos/boton";
import { Titulo } from "@/componentes/atomos/titulo";
import citaNotas from "@/contenido/ilustraciones/cita-notas.webp";
import citaCancelada from "@/contenido/ilustraciones/cita-cancelada.webp";
import { cn } from "@/componentes/cn";
import type { CitaPublica, EstadoCita } from "@/contratos/cita";
import { SIN_CONEXION } from "@/contratos/resultado";
import { cancelarCitaAccion, reprogramarCitaAccion } from "@/servidor/acciones";
import { formatoFecha, formatoHora, formatoFechaHora } from "@/servidor/fechas";
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

const PRINCIPAL = claseBoton("principal");
const SECUNDARIO = claseBoton("borde");

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
  const [cancelada, setCancelada] = useState(false);
  const dialogoCancelar = useRef<HTMLDialogElement>(null);

  const estadoActual = cancelada ? "CANCELADA" : cita.estado;
  const estado = ESTADOS[estadoActual];
  const activa = estadoActual === "PENDIENTE" || estadoActual === "AUTORIZADA";

  useEffect(() => {
    if (vista !== "confirmar-cancelar") return;
    const dialogo = dialogoCancelar.current;
    dialogo?.showModal();
    return () => dialogo?.close();
  }, [vista]);

  const cambiarVista = (nueva: typeof vista) => {
    setError(null);
    setVista(nueva);
  };

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
      setCancelada(true);
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
    <div className="mx-auto grid max-w-lectura gap-bloque md:grid-cols-2 md:gap-cabecera">
      <div className="space-y-5">
        <Titulo nivel="h1" tamano="pagina">
          Tu cita
        </Titulo>
        <div className="space-y-3">
          <span
            className={cn(
              "inline-block rounded-pildora px-3 py-1 text-caption font-medio",
              estado.tono,
            )}
          >
            {estado.nombre}
          </span>
          <Titulo nivel="h2" tamano="h1">
            {cita.servicio}
          </Titulo>
        </div>
        <div className="grid grid-cols-2 rounded-m bg-fondo-suave p-4">
          <div className="pr-4">
            <p className="text-caption font-medio text-texto-secundario">
              Cuándo
            </p>
            <p className="text-h2 text-texto-titulo first-letter:uppercase">
              {formatoFecha(new Date(cita.inicio))}
            </p>
          </div>
          <div className="border-l border-borde-suave pl-4">
            <p className="text-caption font-medio text-texto-secundario">
              Hora
            </p>
            <p className="text-h2 text-texto-titulo">
              {formatoHora(new Date(cita.inicio))}
            </p>
          </div>
        </div>
        <dl>
          {[
            ["Con quién", cita.psicologoNombre],
            ["Dónde", cita.lugar],
            ["Código de referencia", cita.codigo],
          ].map(([etiqueta, valor]) => (
            <div key={etiqueta} className="border-b border-borde-suave py-4">
              <dt className="text-caption font-medio text-texto-secundario">
                {etiqueta}
              </dt>
              <dd className="text-h2 text-texto-titulo">{valor}</dd>
            </div>
          ))}
        </dl>
        {activa && !cita.puedeCancelar && (
          <p
            id="plazo-cita"
            className="rounded-m bg-fondo-suave p-4 text-caption"
          >
            Ya pasó el plazo para cancelar o reprogramar esta cita en línea. Si
            no puedes asistir,{" "}
            <Link href="/contacto" className="text-texto-enlace underline">
              avísanos
            </Link>
            .
          </p>
        )}
        {activa && cita.puedeCancelar && !cita.puedeReprogramar && (
          <p
            id="limite-reprogramaciones"
            className="rounded-m bg-fondo-suave p-4 text-caption"
          >
            Ya usaste las reprogramaciones permitidas. Aún puedes cancelar tu
            cita.
          </p>
        )}

        {error && vista !== "confirmar-cancelar" && (
          <p
            role="alert"
            className="p-4 rounded-m bg-error-fondo text-error-texto text-caption font-medio"
          >
            {error}
          </p>
        )}

        {vista === "confirmar-cancelar" && (
          <dialog
            ref={dialogoCancelar}
            aria-labelledby="titulo-cancelar"
            aria-describedby="descripcion-cancelar"
            onCancel={(evento) => {
              evento.preventDefault();
              if (!ocupado) cambiarVista("detalle");
            }}
            className="m-auto w-[calc(100%-32px)] max-w-lg space-y-4 rounded-m border border-borde bg-fondo-superficie p-5 text-texto-principal shadow-flotante backdrop:bg-morado-900/40"
          >
            <h2
              id="titulo-cancelar"
              className="text-h2 font-fuerte text-texto-titulo"
            >
              ¿Cancelar esta cita?
            </h2>
            <p
              id="descripcion-cancelar"
              className="text-p text-texto-secundario"
            >
              El horario queda libre para otra persona. Si luego quieres
              atención, puedes pedir una cita nueva.
            </p>
            {error && (
              <p role="alert" className="text-caption text-error-texto">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Boton disabled={ocupado} onClick={() => cambiarVista("detalle")}>
                Mantener mi cita
              </Boton>
              <Boton
                tipo="borde"
                className="text-error-texto"
                disabled={ocupado}
                onClick={cancelar}
              >
                {ocupado ? "Cancelando…" : "Sí, cancelar"}
              </Boton>
            </div>
          </dialog>
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
                <strong>{formatoFechaHora(new Date(elegido.inicio))}</strong>.
                La cita actual se cancela y te llega un correo con el enlace
                nuevo.
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
                onClick={() => cambiarVista("detalle")}
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </div>
      <aside className="flex flex-col items-center gap-5 text-center md:pt-cabecera">
        <Image
          src={estadoActual === "CANCELADA" ? citaCancelada : citaNotas}
          alt=""
          sizes="(max-width: 599px) calc(100vw - 32px), 283px"
          className="w-full max-w-[283px]"
        />
        <p className="text-p text-texto-secundario">{estado.texto}</p>
        {vista !== "reprogramar" && (
          <div className="flex w-full max-w-[253px] flex-col gap-3">
            {activa && (
              <Boton
                className="w-full"
                disabled={!cita.puedeReprogramar}
                aria-describedby={
                  !cita.puedeCancelar
                    ? "plazo-cita"
                    : !cita.puedeReprogramar
                      ? "limite-reprogramaciones"
                      : undefined
                }
                onClick={() => cambiarVista("reprogramar")}
              >
                Reprogramar mi cita
              </Boton>
            )}
            {activa && (
              <Boton
                tipo="borde"
                className="w-full text-error-texto"
                disabled={!cita.puedeCancelar}
                aria-describedby={
                  !cita.puedeCancelar ? "plazo-cita" : undefined
                }
                onClick={() => cambiarVista("confirmar-cancelar")}
              >
                Cancelar mi cita
              </Boton>
            )}
            {!activa && (
              <BotonEnlace href="/pedir-cita" className="w-full">
                Pedir otra cita
              </BotonEnlace>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
