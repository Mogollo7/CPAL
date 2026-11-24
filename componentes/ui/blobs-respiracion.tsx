"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";

const forma =
  "M104 35C145 23 180 24 221 28C263 31 278 51 273 83C269 108 290 129 296 153C305 188 273 203 237 197C206 191 180 179 146 188C108 197 76 209 50 188C24 167 25 139 28 114C30 86 55 51 104 35Z";
const formaExpandida =
  "M98 31C144 18 188 21 227 23C273 25 290 47 281 81C275 111 299 130 305 155C314 192 280 207 240 200C206 193 183 183 147 192C106 202 71 212 45 193C15 171 21 136 24 109C27 78 52 47 98 31Z";
const contorno =
  "M94 19C130 26 155 39 191 37C225 34 253 45 272 68C295 97 294 121 278 147C259 176 229 193 193 201C159 209 125 204 87 208C51 211 26 199 22 171C19 148 31 127 24 103C18 81 6 64 17 44C31 18 61 12 94 19Z";
const contornoExpandido =
  "M92 14C129 21 156 33 194 34C227 33 258 43 280 66C305 93 302 123 286 150C263 183 233 199 195 207C161 216 124 208 84 212C48 215 19 201 16 172C13 147 26 127 19 101C13 80 1 60 12 39C27 13 58 8 92 14Z";

export function BlobsRespiracion({ activo }: { activo: boolean }) {
  const gradiente = useId();
  const movimientoReducido = useReducedMotion();
  const animar = activo && !movimientoReducido;

  const transicion = animar
    ? {
        duration: 10,
        times: [0, 0.4, 1],
        ease: "easeInOut" as const,
        repeat: 5,
      }
    : { duration: 0 };

  return (
    <svg
      aria-hidden="true"
      className="block h-auto w-full"
      viewBox="-4 -4 318 228"
    >
      <defs>
        <radialGradient id={gradiente} cx="47%" cy="44%" r="69%">
          <stop offset="0" stopColor="white" stopOpacity={0.94} />
          <stop offset="0.48" stopColor="white" stopOpacity={0.79} />
          <stop
            offset="0.76"
            stopColor="var(--color-morado-100)"
            stopOpacity={0.87}
          />
          <stop
            offset="1"
            stopColor="var(--color-morado-300)"
            stopOpacity={0.92}
          />
        </radialGradient>
      </defs>
      <motion.path
        d={forma}
        fill={`url(#${gradiente})`}
        initial={false}
        animate={{ d: animar ? [forma, formaExpandida, forma] : forma }}
        transition={transicion}
      />
      <motion.path
        d={contorno}
        fill="none"
        stroke="#878DCC"
        strokeOpacity={0.92}
        strokeWidth={2}
        initial={false}
        animate={{
          d: animar ? [contorno, contornoExpandido, contorno] : contorno,
        }}
        transition={transicion}
      />
    </svg>
  );
}
