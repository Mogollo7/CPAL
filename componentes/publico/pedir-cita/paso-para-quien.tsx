import { Baby, User, Users, type LucideIcon } from "lucide-react";
import { Campo } from "@/componentes/ui/campo";
import { cn } from "@/componentes/ui/cn";
import {
  EncabezadoPaso,
  Navegacion,
  type Borrador,
  type PropsPaso,
} from "./piezas";

const OPCIONES: {
  valor: Borrador["paraQuien"];
  icono: LucideIcon;
  titulo: string;
  texto: string;
}[] = [
  {
    valor: "PROPIA",
    icono: User,
    titulo: "Para mí",
    texto: "Soy la persona que asistirá a la sesión.",
  },
  {
    valor: "OTRA_PERSONA",
    icono: Users,
    titulo: "Otra persona adulta",
    texto: "Agendo para un familiar o allegado mayor de 18 años.",
  },
  {
    valor: "MENOR",
    icono: Baby,
    titulo: "Menor de edad",
    texto: "Niño, niña o adolescente menor de 18 años.",
  },
];

/** Mismos obligatorios que `citaSchema` (contratos/cita.ts). */
export function pasoParaQuienCompleto(d: Borrador): boolean {
  if (d.paraQuien === "PROPIA") return true;
  if (!d.pacienteNombre.trim()) return false;
  if (d.paraQuien === "OTRA_PERSONA") return true;
  return Boolean(
    d.pacienteEdad && d.acudienteNombre.trim() && d.acudienteDocumento.trim(),
  );
}

export function PasoParaQuien({
  datos,
  cambiar,
  alVolver,
  alSeguir,
}: PropsPaso & { alVolver: () => void; alSeguir: () => void }) {
  const campo = (
    id: string,
    etiqueta: string,
    llave: keyof Borrador,
    extra: Partial<Parameters<typeof Campo>[0]> = {},
  ) => (
    <Campo
      id={id}
      etiqueta={etiqueta}
      valor={String(datos[llave])}
      alCambiar={(v) => cambiar({ [llave]: v })}
      {...extra}
    />
  );

  return (
    <div className="space-y-6">
      <EncabezadoPaso paso={2} titulo="¿Para quién es la cita?">
        Necesitamos saber si la atención es para ti, para otra persona o para un
        menor de edad.
      </EncabezadoPaso>

      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        role="radiogroup"
        aria-label="¿Para quién es la cita?"
      >
        {OPCIONES.map(({ valor, icono: Icono, titulo, texto }) => (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={datos.paraQuien === valor}
            onClick={() => cambiar({ paraQuien: valor })}
            className={cn(
              "p-5 rounded-m border text-left flex flex-col justify-between gap-3 transition-colors",
              "focus-visible:outline-3 focus-visible:outline-foco",
              datos.paraQuien === valor
                ? "border-morado-600 bg-morado-50 shadow-xs ring-1 ring-morado-600"
                : "border-borde-suave bg-fondo-superficie hover:bg-morado-50/40",
            )}
          >
            <Icono className="w-6 h-6 text-morado-600" aria-hidden="true" />
            <div>
              <h3 className="font-fuerte text-p text-texto-titulo">{titulo}</h3>
              <p className="text-caption text-texto-secundario mt-1">{texto}</p>
            </div>
          </button>
        ))}
      </div>

      {datos.paraQuien === "OTRA_PERSONA" && (
        <div className="rounded-m bg-crema border border-borde-suave p-6 space-y-4">
          <h3 className="font-fuerte text-p text-texto-titulo">
            Datos del paciente (persona que asistirá)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {campo(
              "paciente-nombre",
              "Nombre completo del paciente *",
              "pacienteNombre",
              {
                required: true,
                placeholder: "Ej. Carlos Restrepo",
              },
            )}
            {campo(
              "paciente-doc",
              "Documento de identidad",
              "pacienteDocumento",
              {
                placeholder: "Sin puntos ni espacios",
              },
            )}
          </div>
        </div>
      )}

      {datos.paraQuien === "MENOR" && (
        <div className="rounded-m bg-crema border border-borde-suave p-6 space-y-5">
          <div className="space-y-1">
            <h3 className="font-fuerte text-p text-texto-titulo">
              Datos del menor de edad
            </h3>
            <p className="text-caption text-tinta-suave">
              Debe acudir a la cita en compañía de su acudiente legal.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {campo(
              "menor-nombre",
              "Nombre completo del menor *",
              "pacienteNombre",
              {
                required: true,
                className: "sm:col-span-2",
              },
            )}
            {campo("menor-edad", "Edad (años) *", "pacienteEdad", {
              type: "number",
              min: 0,
              max: 17,
              required: true,
            })}
            {campo("menor-doc", "Documento del menor", "pacienteDocumento", {
              className: "sm:col-span-3",
            })}
          </div>
          <div className="border-t border-borde-suave pt-4 space-y-3">
            <h4 className="font-fuerte text-p text-texto-titulo">
              Padre, madre o acudiente legal responsable
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {campo(
                "acudiente-nombre",
                "Nombre completo del acudiente *",
                "acudienteNombre",
                {
                  required: true,
                },
              )}
              {campo(
                "acudiente-doc",
                "Documento del acudiente *",
                "acudienteDocumento",
                {
                  required: true,
                },
              )}
            </div>
          </div>
        </div>
      )}

      <Navegacion
        alVolver={alVolver}
        alSeguir={alSeguir}
        puedeSeguir={pasoParaQuienCompleto(datos)}
        texto="Continuar a horario"
      />
    </div>
  );
}
