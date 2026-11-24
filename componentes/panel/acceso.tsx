"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import accesoIngresar from "@/contenido/ilustraciones/acceso-ingresar.webp";
import accesoCodigo from "@/contenido/ilustraciones/acceso-codigo.webp";
import {
  crearClaveAccion,
  ingresarAccion,
  reenviarCodigoAccion,
  solicitarEnlaceAccion,
  verificarCodigoAccion,
} from "@/servidor/cuentas/acciones";
import { Aviso, Boton, Campo } from "./controles";

function EnlaceIngreso() {
  return (
    <Link href="/ingresar" className="text-texto-enlace underline">
      Volver a ingresar
    </Link>
  );
}

function FormularioCodigo({ volver }: { volver: () => void }) {
  const [resultado, verificar, pendiente] = useActionState(
    verificarCodigoAccion,
    null,
  );
  const [reenvio, setReenvio] = useState<{ mensaje: string; error: boolean }>();
  const [reenviando, setReenviando] = useState(false);

  async function reenviar() {
    setReenviando(true);
    try {
      const r = await reenviarCodigoAccion();
      setReenvio({
        mensaje: r.ok ? "Enviamos un código nuevo." : r.mensaje,
        error: !r.ok,
      });
    } finally {
      setReenviando(false);
    }
  }

  return (
    <>
      <p>Ingresa el código de 6 dígitos que enviamos a tu correo.</p>
      <form action={verificar} className="grid gap-4">
        <Campo
          etiqueta="Código de verificación"
          name="codigo"
          autoComplete="one-time-code"
          inputMode="numeric"
          pattern="[0-9]{6}"
          required
        />
        <label className="flex items-center gap-3">
          <input name="recordar" type="checkbox" /> Recordar este dispositivo
          por 30 días
        </label>
        {resultado && !resultado.ok && <Aviso error>{resultado.mensaje}</Aviso>}
        <Boton disabled={pendiente || reenviando}>
          {pendiente ? "Verificando…" : "Verificar código"}
        </Boton>
      </form>
      {reenvio && <Aviso error={reenvio.error}>{reenvio.mensaje}</Aviso>}
      <div className="flex flex-wrap gap-3">
        <Boton
          tono="secundario"
          onClick={reenviar}
          disabled={pendiente || reenviando}
        >
          {reenviando ? "Reenviando…" : "Reenviar código"}
        </Boton>
        <Boton tono="secundario" onClick={volver}>
          Volver
        </Boton>
      </div>
    </>
  );
}

export function Acceso() {
  const [paso, setPaso] = useState(false);
  const [resultado, ingresar, pendiente] = useActionState(
    async (previo: unknown, datos: FormData) => {
      const r = await ingresarAccion(previo, datos);
      if (!r.ok && r.codigo === "CODIGO_REQUERIDO") setPaso(true);
      return r;
    },
    null,
  );
  return (
    <div className="grid items-stretch gap-4 md:grid-cols-2">
      <div className="grid min-w-0 content-center gap-4 md:p-6">
        <h1 className="text-h1 font-fuerte text-texto-titulo">
          {paso ? "Segundo paso de seguridad" : "Ingresar al panel"}
        </h1>
        {paso ? (
          <FormularioCodigo volver={() => setPaso(false)} />
        ) : (
          <>
            <form action={ingresar} className="grid gap-4">
              <Campo
                etiqueta="Correo"
                name="correo"
                type="email"
                autoComplete="username"
                maxLength={120}
                required
              />
              <Campo
                etiqueta="Contraseña"
                name="clave"
                type="password"
                autoComplete="current-password"
                maxLength={200}
                required
              />
              {resultado &&
                !resultado.ok &&
                resultado.codigo !== "CODIGO_REQUERIDO" && (
                  <Aviso error>{resultado.mensaje}</Aviso>
                )}
              <Boton disabled={pendiente}>
                {pendiente ? "Ingresando…" : "Ingresar"}
              </Boton>
            </form>
            <Link
              href="/recuperar-clave"
              className="text-texto-enlace underline"
            >
              Olvidé mi contraseña
            </Link>
          </>
        )}
      </div>
      <div className="ilustracion-ingreso hidden items-center justify-center rounded-l bg-morado-100 p-5 md:flex">
        <Image
          src={paso ? accesoCodigo : accesoIngresar}
          alt=""
          sizes="(min-width: 1080px) 420px, (min-width: 900px) 40vw, 0px"
          className="h-auto w-full max-w-[420px] object-contain"
        />
      </div>
    </div>
  );
}

export function ActivarCuenta({ token }: { token: string }) {
  const [resultado, crear, pendiente] = useActionState(crearClaveAccion, null);
  const error = resultado && !resultado.ok ? resultado : null;
  return (
    <>
      <form action={crear} className="grid gap-4">
        <input type="hidden" name="token" value={token} />
        <Campo
          etiqueta="Contraseña nueva"
          name="clave"
          type="password"
          autoComplete="new-password"
          minLength={10}
          maxLength={200}
          error={error?.campos?.clave}
          required
        />
        <Campo
          etiqueta="Repite la contraseña"
          name="confirmacion"
          type="password"
          autoComplete="new-password"
          minLength={10}
          maxLength={200}
          error={error?.campos?.confirmacion}
          required
        />
        {error && <Aviso error>{error.mensaje}</Aviso>}
        <Boton disabled={pendiente}>
          {pendiente ? "Guardando…" : "Guardar e ingresar"}
        </Boton>
      </form>
      <EnlaceIngreso />
    </>
  );
}

export function RecuperarAcceso() {
  const [resultado, solicitar, pendiente] = useActionState(
    solicitarEnlaceAccion,
    null,
  );
  return (
    <>
      {resultado?.ok ? (
        <Aviso>Si la cuenta existe, recibirás un correo con el enlace.</Aviso>
      ) : (
        <form action={solicitar} className="grid gap-4">
          <Campo
            etiqueta="Correo"
            name="correo"
            type="email"
            autoComplete="username"
            maxLength={120}
            error={resultado?.campos?.correo}
            required
          />
          {resultado && <Aviso error>{resultado.mensaje}</Aviso>}
          <Boton disabled={pendiente}>
            {pendiente ? "Solicitando…" : "Solicitar enlace"}
          </Boton>
        </form>
      )}
      <EnlaceIngreso />
    </>
  );
}
