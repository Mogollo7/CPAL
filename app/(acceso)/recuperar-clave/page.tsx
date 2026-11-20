"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Titulo } from "@/componentes/atomos/titulo";
import { claseBoton } from "@/componentes/atomos/boton";
import { Campo } from "@/componentes/moleculas/campo";
import { solicitarEnlaceAccion } from "@/servidor/cuentas/acciones";
import accesoRecuperar from "@/contenido/ilustraciones/acceso-recuperar.webp";

export default function PaginaRecuperarClave() {
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();
  const [correo, setCorreo] = useState("");

  const manejarEnvio = (formData: FormData) => {
    setError(null);
    iniciarTransicion(async () => {
      const res = await solicitarEnlaceAccion(null, formData);
      if (res.ok) {
        setEnviado(true);
      } else {
        setError(res.mensaje || "Ocurrió un error al procesar tu solicitud.");
      }
    });
  };

  return (
    <div className="w-full max-w-[1080px] bg-fondo-superficie rounded-xl shadow-flotante p-5 grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
      {/* Columna izquierda: formulario e información */}
      <div className="flex flex-col justify-center p-6 w-full max-w-[464px] mx-auto">
        <div className="mb-5">
          <Titulo nivel="h1" tamano="seccion">
            Recuperar contraseña
          </Titulo>
          <p className="text-h2 text-texto-secundario mt-2">
            Te enviaremos un enlace de acceso seguro a tu correo institucional.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-4 rounded-m bg-error-fondo border border-error-texto/20 flex items-start gap-2 text-error-texto text-caption font-medio"
          >
            <AlertCircle className="size-[16px] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {enviado ? (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-m bg-exito-fondo text-exito-texto border border-exito-texto/20 text-left">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="size-[20px] text-agua-700 shrink-0" />
                <h2 className="font-fuerte text-h2 text-exito-texto">
                  Revisa tu correo
                </h2>
              </div>
              <p className="text-caption text-exito-texto leading-relaxed">
                Si tu cuenta existe en el sistema del CAPL, recibirás un enlace
                válido durante 24–48 horas para restablecer tu contraseña.
              </p>
            </div>

            <Link
              href="/ingresar"
              className="inline-flex items-center gap-2 text-caption font-fuerte text-texto-enlace hover:underline pt-2"
            >
              <ArrowLeft className="size-[16px]" />
              <span>Volver a la pantalla de ingreso</span>
            </Link>
          </div>
        ) : (
          <form action={manejarEnvio} className="space-y-4">
            <Campo
              id="correo"
              name="correo"
              type="email"
              required
              etiqueta="Correo institucional registrado"
              placeholder="ejemplo@unisalle.edu.co"
              autoComplete="email"
              valor={correo}
              alCambiar={setCorreo}
            />

            <button
              type="submit"
              disabled={pendiente}
              className={claseBoton("principal", "w-full")}
            >
              <span>
                {pendiente
                  ? "Enviando enlace..."
                  : "Enviar enlace de recuperación"}
              </span>
            </button>

            <div className="pt-3 text-center">
              <Link
                href="/ingresar"
                className="inline-flex items-center gap-1.5 text-caption font-medio text-texto-secundario hover:text-texto-principal transition-colors"
              >
                <ArrowLeft className="size-[14px]" />
                <span>Volver a ingresar</span>
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Columna derecha: panel lavanda con la ilustración centrada */}
      <div className="flex items-center justify-center bg-morado-100 rounded-l p-5">
        <Image
          src={accesoRecuperar}
          alt=""
          sizes="486px"
          priority
          className="w-full max-w-[420px] h-auto object-contain"
        />
      </div>
    </div>
  );
}
