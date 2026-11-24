import type { ComponentProps, ReactNode } from "react";

const baseBoton =
  "inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-s px-4 py-3 font-medio disabled:cursor-wait disabled:opacity-60";
const tonos = {
  principal: "bg-accion-fondo text-accion-texto hover:bg-accion-fondo-activo",
  secundario: "bg-accion-suave-fondo text-accion-suave-texto hover:underline",
  peligro: "bg-error-fondo text-error-texto hover:underline",
};

export function Boton({
  tono = "principal",
  className = "",
  ...props
}: ComponentProps<"button"> & { tono?: keyof typeof tonos }) {
  return (
    <button className={`${baseBoton} ${tonos[tono]} ${className}`} {...props} />
  );
}

export function Campo({
  etiqueta,
  error,
  ...props
}: ComponentProps<"input"> & { etiqueta: string; error?: string }) {
  const errorId = `${props.name}-error`;
  return (
    <label className="grid gap-2 font-medio">
      {etiqueta}
      <input
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="w-full rounded-s border border-borde-control bg-fondo-superficie px-3 py-3 font-normal"
      />
      {error && (
        <span id={errorId} className="text-caption text-error-texto">
          {error}
        </span>
      )}
    </label>
  );
}

export function Aviso({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <p
      role={error ? "alert" : "status"}
      className={`rounded-s p-3 ${error ? "bg-error-fondo text-error-texto" : "bg-exito-fondo text-exito-texto"}`}
    >
      {children}
    </p>
  );
}

export function Superficie({
  children,
  titulo,
  id,
}: {
  children: ReactNode;
  titulo: string;
  id: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className="grid content-start gap-4 rounded-l border border-borde-suave bg-fondo-superficie p-4 shadow-flotante sm:p-5"
    >
      <h2 id={id} className="text-h2 font-fuerte text-texto-titulo">
        {titulo}
      </h2>
      {children}
    </section>
  );
}
