"use client";

import { useState, type FormEvent } from "react";
import { Boton } from "@/componentes/atomos/boton";
import { Titulo } from "@/componentes/atomos/titulo";
import { Campo, CLASE_CONTROL } from "@/componentes/moleculas/campo";
import { TarjetaPanel } from "@/componentes/panel/tarjeta-panel";
import { useConfirmacion } from "@/componentes/panel/confirmar-clave";
import type { CitaLista } from "@/contratos/cita";
import type { Cupo } from "@/contratos/cupo";
import { SIN_CONEXION } from "@/contratos/resultado";
import {
  listarPsicologosDeServicioAccion,
  obtenerCuposAccion,
  reasignarCitaAccion,
} from "@/servidor/acciones";
import { fechaBogota, formatoFechaHora, formatoHora } from "@/servidor/fechas";
import { fechaValida, rangoBogota } from "./consulta-citas";
import { ModalAccionCita } from "./modal-accion-cita";

export function ReasignarCita({
  cita,
  alReasignar,
}: {
  cita: CitaLista & { servicioId: string };
  alReasignar: (datos: CitaLista) => void;
}) {
  const [equipo, setEquipo] = useState<{ id: string; nombre: string }[]>();
  const [psicologoId, setPsicologoId] = useState("");
  const [fecha, setFecha] = useState("");
  const [cupos, setCupos] = useState<Cupo[]>();
  const [inicio, setInicio] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const { conConfirmacion, dialogo } = useConfirmacion();

  async function abrir() {
    setAbierto(true);
    if (equipo) return;
    setCargando(true);
    setError("");
    try {
      const resultado = await listarPsicologosDeServicioAccion(cita.servicioId);
      if (resultado.ok) setEquipo(resultado.datos);
      else setError(resultado.mensaje);
    } catch {
      setError(SIN_CONEXION);
    } finally {
      setCargando(false);
    }
  }

  function limpiarCupos() {
    setInicio("");
    setCupos(undefined);
    setError("");
  }

  async function buscar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!psicologoId || !fechaValida(fecha)) return;
    limpiarCupos();
    setCargando(true);
    try {
      const resultado = await obtenerCuposAccion({
        servicioId: cita.servicioId,
        psicologoId,
        ...rangoBogota(fecha),
      });
      if (resultado.ok)
        setCupos(
          Array.isArray(resultado.datos)
            ? resultado.datos
            : resultado.datos.cupos,
        );
      else setError(resultado.mensaje);
    } catch {
      setError(SIN_CONEXION);
    } finally {
      setCargando(false);
    }
  }

  async function reasignar() {
    try {
      const resultado = await conConfirmacion(() =>
        reasignarCitaAccion({ id: cita.id, psicologoId, inicio }),
      );
      if (!resultado.ok) return { ok: false, mensaje: resultado.mensaje };
      alReasignar(resultado.datos);
      setAbierto(false);
      limpiarCupos();
      return { ok: true };
    } catch {
      return { ok: false, mensaje: SIN_CONEXION };
    }
  }

  const nombre = equipo?.find(({ id }) => id === psicologoId)?.nombre;

  return (
    <div className="space-y-3">
      <Boton
        tipo="borde"
        aria-expanded={abierto}
        aria-controls="reasignar-cita"
        disabled={cargando}
        onClick={abierto ? () => setAbierto(false) : abrir}
      >
        Reasignar cita
      </Boton>
      <div id="reasignar-cita" hidden={!abierto}>
        <TarjetaPanel>
          <div className="space-y-3">
            <Titulo nivel="h3" tamano="tarjeta">
              Elige profesional y horario
            </Titulo>
            {cargando && <p role="status">Consultando disponibilidad…</p>}
            {error && (
              <p role="alert" className="text-error-texto">
                {error}
              </p>
            )}
            {!equipo && !cargando && (
              <Boton tipo="borde" onClick={abrir}>
                Volver a consultar profesionales
              </Boton>
            )}
            {equipo?.length === 0 && (
              <p>
                No hay profesionales con horario publicado para este servicio.
              </p>
            )}
            {!!equipo?.length && (
              <form
                onSubmit={buscar}
                className="grid items-end gap-3 sm:grid-cols-2"
              >
                <label className="space-y-1 text-caption">
                  Profesional
                  <select
                    required
                    value={psicologoId}
                    disabled={cargando}
                    className={CLASE_CONTROL}
                    onChange={(evento) => {
                      setPsicologoId(evento.target.value);
                      limpiarCupos();
                    }}
                  >
                    <option value="">Elige un profesional</option>
                    {equipo.map(({ id, nombre }) => (
                      <option key={id} value={id}>
                        {nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <Campo
                  id="fecha-reasignacion"
                  etiqueta="Fecha (hora de Bogotá)"
                  type="date"
                  required
                  min={fechaBogota(new Date())}
                  disabled={cargando}
                  valor={fecha}
                  alCambiar={(valor) => {
                    setFecha(valor);
                    limpiarCupos();
                  }}
                />
                <div>
                  <Boton tipo="borde" type="submit" disabled={cargando}>
                    Buscar horarios
                  </Boton>
                </div>
              </form>
            )}
            {cupos?.length === 0 && (
              <p role="status">
                No hay horarios disponibles para ese día. Prueba otra fecha.
              </p>
            )}
            {!!cupos?.length && (
              <div className="space-y-3">
                <label className="block space-y-1 text-caption">
                  Horario disponible
                  <select
                    value={inicio}
                    className={CLASE_CONTROL}
                    onChange={(evento) => setInicio(evento.target.value)}
                  >
                    <option value="">Elige un horario</option>
                    {cupos.map((cupo) => (
                      <option key={cupo.inicio} value={cupo.inicio}>
                        {formatoHora(new Date(cupo.inicio))} –{" "}
                        {formatoHora(new Date(cupo.fin))}
                      </option>
                    ))}
                  </select>
                </label>
                <Boton disabled={!inicio} onClick={() => setConfirmar(true)}>
                  Revisar reasignación
                </Boton>
              </div>
            )}
          </div>
        </TarjetaPanel>
      </div>
      <ModalAccionCita
        abierto={confirmar}
        alCerrar={() => setConfirmar(false)}
        titulo="Confirma la reasignación"
        descripcion={
          inicio
            ? `La cita quedará con ${nombre} el ${formatoFechaHora(new Date(inicio))}, hora de Bogotá.`
            : ""
        }
        textoBoton="Confirmar reasignación"
        alConfirmar={reasignar}
      />
      {dialogo}
    </div>
  );
}
