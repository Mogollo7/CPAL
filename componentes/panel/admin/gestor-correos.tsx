"use client";

import { useState, useTransition } from "react";
import { MailCheck } from "lucide-react";
import { Boton } from "@/componentes/atomos/boton";
import { Titulo } from "@/componentes/atomos/titulo";
import { SIN_CONEXION } from "@/contratos/resultado";
import {
  reintentarTrabajoAccion,
  trabajosFallidosAccion,
} from "@/servidor/acciones";
import { EstadoVacio } from "../estado-vacio";
import { TarjetaPanel } from "../tarjeta-panel";

type TrabajoFallido = {
  id: string;
  plantilla: string;
  intentos: number;
  creadoEn: Date;
};

const fecha = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Bogota",
});

export function GestorCorreos({ iniciales }: { iniciales: TrabajoFallido[] }) {
  const [trabajos, setTrabajos] = useState(iniciales);
  const [objetivo, setObjetivo] = useState<string>();
  const [error, setError] = useState<string>();
  const [aviso, setAviso] = useState<string>();
  const [pendiente, iniciar] = useTransition();

  function reintentar(id: string) {
    setObjetivo(id);
    setError(undefined);
    setAviso(undefined);
    iniciar(async () => {
      try {
        const resultado = await reintentarTrabajoAccion(id);
        if (!resultado.ok) {
          setError(resultado.mensaje);
          if (resultado.codigo !== "NO_ENCONTRADO") return;
        } else {
          setAviso("El correo volvió a la cola de envío.");
        }
        setTrabajos((prev) => prev.filter((trabajo) => trabajo.id !== id));
        const lista = await trabajosFallidosAccion();
        if (lista.ok) {
          setTrabajos(lista.datos.trabajos);
        } else {
          setError(resultado.ok ? lista.mensaje : resultado.mensaje);
        }
      } catch {
        setError((prev) => prev ?? SIN_CONEXION);
      }
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="text-error-texto">
          {error}
        </p>
      )}
      {aviso && (
        <p role="status" className="text-exito-texto">
          {aviso}
        </p>
      )}
      {trabajos.length === 0 ? (
        <EstadoVacio
          icono={MailCheck}
          titulo="No hay correos fallidos"
          descripcion="Si un envío agota sus intentos, aparecerá aquí para que puedas volver a ponerlo en la cola."
        />
      ) : (
        <ul className="space-y-3">
          {trabajos.map((trabajo) => (
            <li key={trabajo.id}>
              <TarjetaPanel className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                  <Titulo tamano="tarjeta">
                    {trabajo.plantilla.replaceAll("-", " ") || "Correo"}
                  </Titulo>
                  <p className="text-texto-secundario">
                    <time dateTime={trabajo.creadoEn.toISOString()}>
                      {fecha.format(trabajo.creadoEn)}
                    </time>{" "}
                    · Intentos: {trabajo.intentos}
                  </p>
                </div>
                <Boton
                  tipo="borde"
                  disabled={pendiente}
                  aria-label={`Reintentar correo ${trabajo.plantilla.replaceAll("-", " ")} del ${fecha.format(trabajo.creadoEn)}`}
                  onClick={() => reintentar(trabajo.id)}
                >
                  {pendiente && objetivo === trabajo.id
                    ? "Reintentando…"
                    : "Reintentar"}
                </Boton>
              </TarjetaPanel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
