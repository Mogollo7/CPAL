import { DocumentoLegal } from "@/componentes/organismos/documento-legal";
import React from "react";
import type { Metadata } from "next";
import { AlertTriangle, Lock, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Tratamiento de Datos Personales · CAPL",
  description:
    "Política y marco de protección de datos personales conforme a la Ley 1581 de 2012. Conoce cómo cuidamos tu información y privacidad en el CAPL.",
};

const INDICE = [
  {
    id: "1-identificacion-del-responsable-del-tra",
    titulo: "1. Identificación del responsable del tratamiento",
  },
  { id: "2-marco-legal-aplicable", titulo: "2. Marco legal aplicable" },
  {
    id: "3-datos-personales-recolectados",
    titulo: "3. Datos personales recolectados",
  },
  {
    id: "4-tratamiento-de-datos-sensibles",
    titulo: "4. Tratamiento de datos sensibles",
  },
  {
    id: "5-finalidades-exclusivas-del-tratamiento",
    titulo: "5. Finalidades exclusivas del tratamiento",
  },
  {
    id: "6-derechos-del-titular-habeas-data",
    titulo: "6. Derechos del titular (Habeas Data)",
  },
];

export default function PoliticaDatosPage() {
  return (
    <DocumentoLegal
      titulo="Política de Tratamiento de Datos Personales"
      bajada="Marco de recolección, uso y protección de datos para los consultantes del Centro de Atención Psicológica Lasallista (CAPL) conforme a la Ley 1581 de 2012 de Colombia."
      indice={INDICE}
      otro={{ href: "/terminos", texto: "Leer términos y condiciones" }}
    >
      {/* Cabecera y Navegación */}

      {/* Banner superior obligatorio: Documento provisional */}
      <div
        role="alert"
        className="rounded-m bg-aviso-fondo border-l-4 border-amarillo-700 p-5 shadow-xs"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="w-5 h-5 text-amarillo-700 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <h2 className="text-p font-fuerte text-tinta">
              Documento provisional pendiente de validación jurídica por el CAPL
            </h2>
            <p className="text-p text-tinta leading-texto">
              Esta versión técnica se encuentra en proceso de revisión formal y
              aval por parte de la Coordinación del CAPL y la Dirección Jurídica
              de Unilasallista Corporación Universitaria.
            </p>
          </div>
        </div>
      </div>

      {/* Aviso de Arquitectura: La plataforma NO almacena historias clínicas */}
      <div className="rounded-m bg-morado-50 border border-morado-200 p-5 space-y-2">
        <div className="flex items-center gap-2 text-morado-900 font-fuerte text-p">
          <Lock
            className="w-5 h-5 text-morado-600 shrink-0"
            aria-hidden="true"
          />
          <span>
            Delimitación técnica esencial: Sin historias clínicas en la web
          </span>
        </div>
        <p className="text-p text-texto-principal leading-texto">
          Esta plataforma web se limita exclusivamente a la gestión de citas
          previas e información pública.{" "}
          <strong>
            Bajo ninguna circunstancia se almacenan, gestionan o transmiten
            historias clínicas ni notas terapéuticas
          </strong>{" "}
          a través de este sistema web.
        </p>
      </div>

      {/* Artículos y Secciones */}
      <article className="space-y-8 text-p text-texto-principal leading-texto">
        {/* Sección 1 */}
        <section className="space-y-3">
          <h2 id="1-identificacion-del-responsable-del-tra">
            1. Identificación del responsable del tratamiento
          </h2>
          <ul className="space-y-2 rounded-m bg-fondo-superficie border border-borde-suave p-5">
            <li>
              <strong>Razón Social:</strong> Unilasallista Corporación
              Universitaria — Centro de Atención Psicológica Lasallista (CAPL).
            </li>
            <li>
              <strong>Habilitación en Salud:</strong> Código MinSalud DHS803177
              (atención continua desde 2019).
            </li>
            <li>
              <strong>Sede física:</strong> Carrera 51 # 118 Sur – 57, Caldas,
              Antioquia, Colombia (&quot;casa amarilla&quot;).
            </li>
            <li>
              <strong>Correo para Habeas Data:</strong>{" "}
              capl@unilasallista.edu.co.
            </li>
          </ul>
        </section>

        {/* Sección 2 */}
        <section className="space-y-3">
          <h2 id="2-marco-legal-aplicable">2. Marco legal aplicable</h2>
          <p>
            La presente política se rige en su integridad por la Constitución
            Política de Colombia (art. 15), la Ley Estatutaria 1581 de 2012, el
            Decreto 1377 de 2013, y las normas éticas del ejercicio de la
            psicología contempladas en la Ley 1090 de 2006 (secreto profesional
            y reserva).
          </p>
        </section>

        {/* Sección 3 */}
        <section className="space-y-3">
          <h2 id="3-datos-personales-recolectados">
            3. Datos personales recolectados
          </h2>
          <p>
            Para solicitar una cita a través del sitio web se requieren
            únicamente los datos mínimos indispensables:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Nombre completo e identificación (tipo y número de documento).
            </li>
            <li>Edad, correo electrónico y teléfono de contacto.</li>
            <li>
              En caso de menores de 18 años: nombre e identificación del menor,
              junto con los datos de contacto del padre, madre o acudiente legal
              responsable.
            </li>
            <li>
              Motivo breve de consulta (estrictamente voluntario y opcional).
            </li>
          </ul>
        </section>

        {/* Sección 4 */}
        <section className="space-y-3">
          <h2 id="4-tratamiento-de-datos-sensibles">
            4. Tratamiento de datos sensibles
          </h2>
          <p>
            El motivo de consulta constituye un dato sensible relativo a la
            salud mental:
          </p>
          <div className="p-4 rounded-m bg-crema border border-borde-suave space-y-2">
            <p>
              <strong>Voluntariedad:</strong> Puedes dejar vacío el campo del
              motivo de consulta sin que ello impida solicitar tu cita.
            </p>
            <p>
              <strong>Cifrado y confidencialidad:</strong> Si decides
              escribirlo, se guarda cifrado en reposo y nunca se incluye en
              correos electrónicos transaccionales ni enlaces públicos.
            </p>
          </div>
        </section>

        {/* Sección 5 */}
        <section className="space-y-3">
          <h2 id="5-finalidades-exclusivas-del-tratamiento">
            5. Finalidades exclusivas del tratamiento
          </h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2
                className="w-5 h-5 text-agua-700 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span>
                Gestionar la agenda de citas del CAPL (asignación de cupos y
                confirmaciones).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2
                className="w-5 h-5 text-agua-700 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span>
                Enviar notificaciones indispensables sobre la cita vía correo
                electrónico institucional.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2
                className="w-5 h-5 text-agua-700 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <span>
                Generar reportes estadísticos internos anónimos de demanda del
                servicio.
              </span>
            </li>
          </ul>
          <p className="text-caption text-tinta-suave">
            * Bajo ninguna circunstancia el CAPL comercializa ni transfiere
            bases de datos a terceras partes.
          </p>
        </section>

        {/* Sección 6 */}
        <section className="space-y-3">
          <h2 id="6-derechos-del-titular-habeas-data">
            6. Derechos del titular (Habeas Data)
          </h2>
          <p>
            Conforme a la ley, tienes derecho a conocer, actualizar y rectificar
            tus datos personales, revocar la autorización o solicitar la
            supresión de datos no indispensables mediante comunicación formal a{" "}
            <strong>capl@unilasallista.edu.co</strong>.
          </p>
        </section>
      </article>
    </DocumentoLegal>
  );
}
