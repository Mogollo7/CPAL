import type { InputHTMLAttributes } from "react";
import { cn } from "../cn";

export const CLASE_CONTROL =
  "w-full min-w-0 min-h-[48px] px-4 rounded-m border border-borde bg-blanco text-p text-texto-principal focus-visible:outline-3 focus-visible:outline-foco";

type CampoProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  id: string;
  etiqueta: string;
  valor: string;
  alCambiar: (valor: string) => void;
  error?: string;
};

/** Campo de texto con su etiqueta y, si lo hay, su error debajo (N06). */
export function Campo({
  id,
  etiqueta,
  valor,
  alCambiar,
  error,
  className,
  ...resto
}: CampoProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1 block text-p font-medio text-texto-principal"
      >
        {etiqueta}
      </label>
      <input
        id={id}
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(CLASE_CONTROL, error && "border-error-texto")}
        {...resto}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-p text-error-texto">
          {error}
        </p>
      )}
    </div>
  );
}
