import { Campo } from "@/componentes/moleculas/campo";
import {
  EncabezadoPaso,
  Navegacion,
  type Borrador,
  type PropsPaso,
} from "./piezas";

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Lo mínimo para avanzar; el servidor revalida todo con `citaSchema` al enviar. */
export function pasoDatosCompleto(d: Borrador): boolean {
  const digitos = d.solicitanteTelefono.replace(/\D/g, "").length;
  return Boolean(
    d.solicitanteNombre.trim().length >= 3 &&
    CORREO.test(d.solicitanteCorreo.trim()) &&
    digitos >= 7 &&
    digitos <= 15,
  );
}

export function PasoDatos({
  datos,
  cambiar,
  errores,
  alVolver,
  alSeguir,
}: PropsPaso & {
  errores: Record<string, string>; // los `campos` de un VALIDACION del servidor
  alVolver: () => void;
  alSeguir: () => void;
}) {
  return (
    <div className="space-y-6">
      <EncabezadoPaso paso={4} titulo="Tus datos de contacto">
        Te enviaremos la confirmación y el recordatorio a tu correo.
      </EncabezadoPaso>

      {/* Campo trampa: las personas no lo ven; los robots lo llenan y el servidor los descarta. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="campo-trampa">No llenes este campo:</label>
        <input
          id="campo-trampa"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={datos.sitioWeb}
          onChange={(e) => cambiar({ sitioWeb: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <Campo
          id="sol-nombre"
          etiqueta="Nombre completo *"
          valor={datos.solicitanteNombre}
          alCambiar={(v) => cambiar({ solicitanteNombre: v })}
          error={errores.solicitanteNombre}
          autoComplete="name"
          required
        />
        {datos.paraQuien === "PROPIA" && (
          <Campo
            id="sol-doc"
            etiqueta="Número de documento"
            valor={datos.solicitanteDocumento}
            alCambiar={(v) => cambiar({ solicitanteDocumento: v })}
            error={errores.pacienteDocumento}
            placeholder="Sin puntos ni espacios"
          />
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo
            id="sol-correo"
            etiqueta="Correo electrónico *"
            type="email"
            valor={datos.solicitanteCorreo}
            alCambiar={(v) => cambiar({ solicitanteCorreo: v })}
            error={errores.solicitanteCorreo}
            autoComplete="email"
            placeholder="nombre@correo.com"
            required
          />
          <Campo
            id="sol-tel"
            etiqueta="Celular o WhatsApp *"
            type="tel"
            valor={datos.solicitanteTelefono}
            alCambiar={(v) => cambiar({ solicitanteTelefono: v })}
            error={errores.solicitanteTelefono}
            autoComplete="tel"
            placeholder="Ej. 300 123 4567"
            required
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="sol-motivo"
              className="text-caption font-medio text-texto-principal"
            >
              Motivo de consulta (opcional)
            </label>
            <span className="text-caption text-tinta-suave">
              {datos.motivo.length}/300
            </span>
          </div>
          <textarea
            id="sol-motivo"
            rows={3}
            maxLength={300}
            value={datos.motivo}
            onChange={(e) => cambiar({ motivo: e.target.value })}
            placeholder="Puedes dejarlo vacío si prefieres hablarlo en la sesión."
            className="w-full p-4 rounded-m border border-borde bg-blanco text-texto-principal focus-visible:outline-3 focus-visible:outline-foco resize-none"
          />
          <p className="text-caption text-tinta-suave mt-1">
            Tu motivo se guarda cifrado y no viaja por correo.
          </p>
        </div>
      </div>

      <Navegacion
        alVolver={alVolver}
        alSeguir={alSeguir}
        puedeSeguir={pasoDatosCompleto(datos)}
        texto="Revisar y confirmar"
      />
    </div>
  );
}
