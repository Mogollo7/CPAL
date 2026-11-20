"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Titulo } from "@/componentes/atomos/titulo";
import { claseBoton } from "@/componentes/atomos/boton";
import { Campo } from "@/componentes/moleculas/campo";
import {
  crearClaveAccion,
  solicitarEnlaceAccion,
} from "@/servidor/cuentas/acciones";
import accesoCrearClave from "@/contenido/ilustraciones/acceso-crear-clave.webp";

interface FormularioCrearClaveProps {
  token: string;
}

export function FormularioCrearClave({ token }: FormularioCrearClaveProps) {
  const [mostrarClave, setMostrarClave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enlaceVencido, setEnlaceVencido] = useState(false);
  const [reenvioExitoso, setReenvioExitoso] = useState(false);
  const [pendiente, iniciarTransicion] = useTransition();
  const [clave, setClave] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [correoRenovacion, setCorreoRenovacion] = useState("");

  const manejarEnvio = (formData: FormData) => {
    setError(null);
    iniciarTransicion(async () => {
      const res = await crearClaveAccion(null, formData);
      if (!res.ok) {
        if (
          res.codigo === "ENLACE_INVALIDO" ||
          res.codigo === "ENLACE_VENCIDO"
        ) {
          setEnlaceVencido(true);
        }
        setError(res.mensaje || "Error al definir la contraseña.");
      }
    });
  };

  const manejarSolicitarNuevo = (formData: FormData) => {
    setError(null);
    iniciarTransicion(async () => {
      const res = await solicitarEnlaceAccion(null, formData);
      if (res.ok) {
        setReenvioExitoso(true);
      } else {
        setError(res.mensaje || "No se pudo procesar la solicitud.");
      }
    });
  };

  return (
    <div className="w-full max-w-[1080px] bg-fondo-superficie rounded-xl shadow-flotante p-5 grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
      {/* Columna izquierda: formulario e información */}
      <div className="flex flex-col justify-center p-6 w-full max-w-[464px] mx-auto">
        {enlaceVencido ? (
          <>
            <div className="mb-5">
              <Titulo nivel="h1" tamano="seccion">
                Enlace vencido o no válido
              </Titulo>
              <p className="text-h2 text-texto-secundario mt-2">
                Por seguridad, los enlaces para crear o recuperar contraseña
                tienen una vigencia limitada (24–48 horas) y se invalidan tras
                ser usados.
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

            {reenvioExitoso ? (
              <div className="p-4 rounded-m bg-exito-fondo text-exito-texto border border-exito-texto/20 text-center space-y-2">
                <CheckCircle2 className="size-[24px] mx-auto text-agua-700" />
                <p className="font-fuerte text-p">Solicitud enviada</p>
                <p className="text-caption">
                  Si tu correo está registrado en el CAPL, recibirás un nuevo
                  enlace de acceso de inmediato.
                </p>
                <Link
                  href="/ingresar"
                  className="mt-3 inline-block text-caption font-fuerte text-texto-enlace hover:underline"
                >
                  Volver a la pantalla de ingreso
                </Link>
              </div>
            ) : (
              <form action={manejarSolicitarNuevo} className="space-y-4">
                <Campo
                  id="correo-renovacion"
                  name="correo"
                  type="email"
                  required
                  etiqueta="Ingresa tu correo institucional para recibir otro enlace"
                  placeholder="ejemplo@unisalle.edu.co"
                  autoComplete="email"
                  valor={correoRenovacion}
                  alCambiar={setCorreoRenovacion}
                />

                <button
                  type="submit"
                  disabled={pendiente}
                  className={claseBoton("principal", "w-full")}
                >
                  <span>
                    {pendiente ? "Enviando..." : "Solicitar nuevo enlace"}
                  </span>
                </button>
              </form>
            )}
          </>
        ) : (
          <>
            <div className="mb-5">
              <Titulo nivel="h1" tamano="seccion">
                Crea tu contraseña
              </Titulo>
              <p className="text-h2 text-texto-secundario mt-2">
                Te damos la bienvenida al equipo del CAPL. Define tu clave para
                activar tu cuenta.
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

            <form action={manejarEnvio} className="space-y-4">
              <input type="hidden" name="token" value={token} />

              <div>
                <div className="relative">
                  <Campo
                    id="clave"
                    name="clave"
                    type={mostrarClave ? "text" : "password"}
                    required
                    minLength={10}
                    etiqueta="Nueva contraseña"
                    placeholder="Mínimo 10 caracteres"
                    autoComplete="new-password"
                    valor={clave}
                    alCambiar={setClave}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarClave(!mostrarClave)}
                    className="absolute right-1 top-[25px] flex size-[48px] items-center justify-center text-texto-secundario hover:text-texto-principal"
                    aria-label={
                      mostrarClave ? "Ocultar contraseña" : "Ver contraseña"
                    }
                  >
                    {mostrarClave ? (
                      <EyeOff className="size-[18px]" />
                    ) : (
                      <Eye className="size-[18px]" />
                    )}
                  </button>
                </div>
                <p className="text-caption text-texto-secundario mt-1">
                  Usa al menos 10 caracteres seguros, distintos de tu correo.
                </p>
              </div>

              <div>
                <Campo
                  id="confirmacion"
                  name="confirmacion"
                  type={mostrarClave ? "text" : "password"}
                  required
                  minLength={10}
                  etiqueta="Confirmar contraseña"
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                  valor={confirmacion}
                  alCambiar={setConfirmacion}
                />
              </div>

              <button
                type="submit"
                disabled={pendiente}
                className={claseBoton("principal", "w-full")}
              >
                <span>
                  {pendiente
                    ? "Guardando contraseña..."
                    : "Guardar contraseña e ingresar"}
                </span>
              </button>
            </form>
          </>
        )}
      </div>

      {/* Columna derecha: panel lavanda con la ilustración centrada */}
      <div className="flex items-center justify-center bg-morado-100 rounded-l p-5">
        <Image
          src={accesoCrearClave}
          alt=""
          sizes="486px"
          priority
          className="w-full max-w-[420px] h-auto object-contain"
        />
      </div>
    </div>
  );
}
