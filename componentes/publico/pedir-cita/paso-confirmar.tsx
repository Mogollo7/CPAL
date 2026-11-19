import type { FormEvent } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarPlus } from "lucide-react";
import { formatoFechaHora } from "@/servidor/fechas";
import {
  BotonAtras,
  CLASE_PRINCIPAL,
  EncabezadoPaso,
  type PropsPaso,
} from "./piezas";

const DESTINATARIO = {
  PROPIA: () => "Para mí",
  OTRA_PERSONA: (n: string) => `Otra persona: ${n}`,
  MENOR: (n: string) => `Menor de edad: ${n}`,
};

export function PasoConfirmar({
  datos,
  cambiar,
  servicio,
  psicologo,
  enviando,
  error,
  alVolver,
  alEnviar,
}: PropsPaso & {
  servicio: string;
  psicologo: string;
  enviando: boolean;
  error: string | null;
  alVolver: () => void;
  alEnviar: () => void;
}) {
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (datos.aceptaTratamiento && !enviando) alEnviar();
  };

  const resumen: [string, string][] = [
    ["Servicio", servicio],
    ["Para quién", DESTINATARIO[datos.paraQuien](datos.pacienteNombre)],
    ["Fecha y hora", formatoFechaHora(new Date(datos.inicio))],
    ["Profesional", psicologo],
    ["Te escribiremos a", datos.solicitanteCorreo],
  ];

  return (
    <form onSubmit={enviar} className="space-y-6">
      <EncabezadoPaso paso={5} titulo="Revisa y confirma tu solicitud">
        Verifica que todo esté bien antes de enviar.
      </EncabezadoPaso>

      <div
        role="note"
        className="rounded-m bg-aviso-fondo border-l-4 border-amarillo-700 p-4 text-p text-tinta flex items-start gap-3"
      >
        <AlertTriangle
          className="w-5 h-5 text-amarillo-700 shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="text-caption leading-texto">
          <strong>Recuerda:</strong> el CAPL no atiende urgencias. Si estás en
          peligro o piensas en hacerte daño, comunícate ya con la{" "}
          <Link
            href="/ayuda-inmediata"
            className="text-morado-900 font-fuerte underline"
          >
            Línea 123 o la Guía de Ayuda Inmediata
          </Link>
          .
        </div>
      </div>

      <dl className="rounded-m bg-crema border border-borde-suave p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-p">
        {resumen.map(([etiqueta, valor]) => (
          <div key={etiqueta}>
            <dt className="text-caption text-tinta-suave">{etiqueta}</dt>
            <dd className="font-medio text-texto-titulo first-letter:uppercase">
              {valor}
            </dd>
          </div>
        ))}
      </dl>

      <label className="flex items-start gap-3 cursor-pointer select-none rounded-m bg-fondo-superficie border border-borde-suave p-5">
        <input
          type="checkbox"
          required
          checked={datos.aceptaTratamiento}
          onChange={(e) => cambiar({ aceptaTratamiento: e.target.checked })}
          className="w-5 h-5 rounded-s border-borde text-morado-600 focus:ring-morado-600 shrink-0 mt-0.5"
        />
        <span className="text-caption text-texto-principal leading-texto">
          Acepto la{" "}
          <Link
            href="/privacidad"
            target="_blank"
            className="text-texto-enlace font-medio underline decoration-1 underline-offset-2"
          >
            Política de Tratamiento de Datos Personales
          </Link>{" "}
          del CAPL (Ley 1581 de 2012) y autorizo el uso de mis datos solo para
          coordinar esta cita.
        </span>
      </label>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-m bg-error-fondo text-error-texto text-caption font-medio"
        >
          {error}
        </div>
      )}

      <div className="pt-4 flex items-center justify-between gap-4 border-t border-borde-suave">
        <BotonAtras alVolver={alVolver} />
        <button
          type="submit"
          disabled={!datos.aceptaTratamiento || enviando}
          className={CLASE_PRINCIPAL}
        >
          {enviando ? (
            <span>Enviando…</span>
          ) : (
            <>
              <CalendarPlus className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>Pedir mi cita</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
