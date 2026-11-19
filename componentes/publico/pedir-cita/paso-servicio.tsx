import Link from "next/link";
import { cn } from "@/componentes/ui/cn";
import {
  EncabezadoPaso,
  Navegacion,
  type PropsPaso,
  type ServicioDelFormulario,
} from "./piezas";

export function PasoServicio({
  datos,
  cambiar,
  servicios,
  alSeguir,
}: PropsPaso & { servicios: ServicioDelFormulario[]; alSeguir: () => void }) {
  return (
    <div className="space-y-6">
      <EncabezadoPaso paso={1} titulo="¿Qué servicio necesitas agendar?">
        Selecciona el tipo de atención psicológica o neuropsicológica que
        requieres.
      </EncabezadoPaso>

      {servicios.length === 0 ? (
        // SERVICIO_NO_DISPONIBLE (E04): ninguno se puede pedir en línea ahora.
        <p className="rounded-m bg-crema border border-borde-suave p-6 text-p">
          En este momento no hay servicios para agendar en línea. Escríbenos o
          llámanos desde la página de{" "}
          <Link href="/contacto" className="text-texto-enlace underline">
            contacto
          </Link>{" "}
          y te ayudamos a pedir tu cita.
        </p>
      ) : (
        <div
          className="grid grid-cols-1 gap-4"
          role="radiogroup"
          aria-label="Selecciona un servicio agendable"
        >
          {servicios.map((serv) => {
            const seleccionado = datos.servicioId === serv.id;
            return (
              <button
                key={serv.id}
                type="button"
                role="radio"
                aria-checked={seleccionado}
                // Cambiar de servicio invalida psicólogo y horario elegidos.
                onClick={() =>
                  cambiar({
                    servicioId: serv.id,
                    psicologoId: "",
                    psicologoNombre: "",
                    inicio: "",
                  })
                }
                className={cn(
                  "w-full p-5 rounded-m border text-left transition-colors duration-mov-rapido flex items-start justify-between gap-4",
                  "focus-visible:outline-3 focus-visible:outline-foco focus-visible:outline-offset-2",
                  seleccionado
                    ? "border-morado-600 bg-morado-50/80 shadow-xs ring-1 ring-morado-600"
                    : "border-borde-suave bg-fondo-superficie hover:bg-morado-50/40",
                )}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-caption font-medio text-morado-700 bg-morado-100 px-2.5 py-0.5 rounded-pildora">
                      {serv.area === "NEUROPSICOLOGIA"
                        ? "Neuropsicología"
                        : "Psicología"}
                    </span>
                    <span className="text-caption text-agua-700 font-medio">
                      100% Gratuito
                    </span>
                  </div>
                  <h3 className="text-h2 font-medio text-texto-titulo">
                    {serv.nombre}
                  </h3>
                  <p className="text-p text-texto-principal leading-texto">
                    {serv.descripcion}
                  </p>
                  {serv.paraQuien && (
                    <p className="text-caption text-tinta-suave pt-1">
                      <strong>Para quién:</strong> {serv.paraQuien}
                    </p>
                  )}
                </div>
                <div className="shrink-0 mt-1">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-circulo border-2 flex items-center justify-center transition-colors",
                      seleccionado
                        ? "border-morado-600 bg-morado-600 text-blanco"
                        : "border-borde bg-blanco",
                    )}
                  >
                    {seleccionado && (
                      <span className="w-2 h-2 rounded-circulo bg-blanco" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Navegacion
        alSeguir={alSeguir}
        puedeSeguir={Boolean(datos.servicioId)}
        texto="Continuar"
      />
    </div>
  );
}
