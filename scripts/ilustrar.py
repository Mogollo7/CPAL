#!/usr/bin/env python3
"""Genera una ilustración del CAPL con Codex conservando siempre el mismo estilo.

Uso (desde la raíz del repo):
  python scripts/ilustrar.py --nombre pie-calendario --formato "horizontal 4:3" --con objetos "Calendario de mesa ..."
  python scripts/ilustrar.py --nombre taller-grupo --con personas "Cinco personas sentadas en círculo ..."

Qué hace, siempre igual:
  1. Adjunta la imagen ANCLA (comunidad-unetenos.png): el estilo sale de ella, no de las palabras.
  2. Con --con adjunta además fichas de referencia (contenido/ilustraciones/fichas/): ojos, manos, pelo, ropa...
     Grupos: personas, rostros, mascotas, objetos, escena. También sirven nombres sueltos: --con manos,pelo
  3. Pega el «Bloque de estilo» de contenido/ilustraciones/PROMPTS.md (única fuente del texto).
  4. Pide fondo verde croma plano y lo convierte en transparente, recortando al sujeto.
  5. Guarda contenido/ilustraciones/<nombre>-vN.png sin pisar versiones anteriores.
Las fichas se crean con scripts/fichas.py. Requiere la app de Codex con sesión de ChatGPT y Pillow + numpy.
"""
import argparse, glob, os, re, subprocess, sys, tempfile
from pathlib import Path

import numpy as np
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ILU = RAIZ / "contenido" / "ilustraciones"
ANCLA = ILU / "comunidad-unetenos.png"
FICHAS = ILU / "fichas"
GENERADAS = Path.home() / ".codex" / "generated_images"
CROMA = np.array([0, 255, 0], dtype=np.float32)
GRUPOS = {
    "personas": ["caras", "pelo", "ropa", "manos", "cuerpos", "accesorios"],
    "rostros": ["ojos", "bocas", "narices", "caras", "pelo"],
    "mascotas": ["mascotas"],
    "objetos": ["objetos", "naturaleza"],
    "escena": ["cuerpos", "ropa", "objetos", "naturaleza"],
}


def codex_exe():
    local = os.environ.get("LOCALAPPDATA", "")
    cands = sorted(glob.glob(os.path.join(local, "OpenAI", "Codex", "bin", "*", "codex.exe")), key=os.path.getmtime)
    if not cands:
        sys.exit("No encuentro codex.exe: instala la app de Codex e inicia sesión con ChatGPT.")
    return cands[-1]


def bloque_estilo():
    m = re.search(r"## Bloque de estilo.*?```\n(.*?)```", (ILU / "PROMPTS.md").read_text(encoding="utf-8"), re.S)
    if not m:
        sys.exit("No encuentro el «Bloque de estilo» en PROMPTS.md")
    return m.group(1).strip()


def generar(prompt, referencias):
    """Corre Codex con las imágenes de referencia y devuelve la ruta de la imagen nueva."""
    antes = set(GENERADAS.glob("*/*.png")) if GENERADAS.exists() else set()
    ultimo = tempfile.NamedTemporaryFile(suffix=".txt", delete=False).name
    cmd = [codex_exe(), "exec", "-i", *map(str, referencias), "-s", "read-only", "--skip-git-repo-check",
           "-c", 'model_reasoning_effort="low"', "-o", ultimo, "-"]
    r = subprocess.run(cmd, input=prompt, text=True, encoding="utf-8", capture_output=True, cwd=RAIZ, timeout=900)
    nuevas = sorted(set(GENERADAS.glob("*/*.png")) - antes, key=os.path.getmtime)
    if r.returncode or not nuevas:
        sys.exit(f"Codex no generó imagen (código {r.returncode}).\n{(r.stderr or r.stdout)[-600:]}")
    return nuevas[-1]


def fichas_de(con):
    nombres = []
    for t in filter(None, (x.strip() for x in (con or "").split(","))):
        nombres += GRUPOS.get(t, [t])
    rutas = []
    for n in dict.fromkeys(nombres):
        f = FICHAS / f"{n}.png"
        if not f.exists():
            sys.exit(f"Falta la ficha «{n}». Créala con: python scripts/fichas.py {n}")
        rutas.append(f)
    return rutas


def armar_prompt(sujeto, formato, n_fichas):
    extra = ""
    if n_fichas:
        extra = (f"\nDespués del ancla vienen {n_fichas} FICHAS DE REFERENCIA (catálogo de ojos, bocas, pelo, ropa, manos, cuerpos, objetos…). "
                 "Úsalas como vocabulario de formas, proporciones y trazo: toma de ellas cómo se dibuja cada parte, no su disposición ni su contenido.\n")
    return f"""Genera UNA imagen con tu herramienta de generación de imágenes (no escribas código, SVG ni archivos).
La primera imagen adjunta es el ANCLA DE ESTILO: copia su técnica, textura de grano, trazo, rostros, proporciones, tratamiento del color y nivel de detalle. No copies su contenido.{extra}
{bloque_estilo()}

Formato: {formato}.
Fondo: un único color plano verde croma #00FF00, sin degradado, sin suelo ni sombra proyectada sobre el fondo, y nada de ese verde dentro del sujeto. El sujeto va completo, centrado y con margen.
Sujeto: {sujeto}

Al terminar responde solo con una línea: la ruta del archivo de la imagen generada."""


def quitar_croma(origen, destino):
    a = np.asarray(Image.open(origen).convert("RGB")).astype(np.float32)
    dist = np.sqrt(((a - CROMA) ** 2).sum(-1))
    alfa = np.clip((dist - 70) / (150 - 70), 0, 1)
    borde = alfa < 0.98                       # solo el borde pierde el verde sobrante: las plantas conservan el suyo
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    a[..., 1] = np.where(borde, np.minimum(g, np.maximum(r, b)), g)
    ys, xs = np.where(alfa > 0.02)
    if not len(ys):
        sys.exit("El fondo croma ocupó toda la imagen: no hay sujeto. Revisa el original.")
    m = int(0.03 * max(a.shape[:2]))
    y0, y1, x0, x1 = max(ys.min() - m, 0), ys.max() + m, max(xs.min() - m, 0), xs.max() + m
    rgba = np.dstack([a, alfa * 255])[y0:y1, x0:x1].clip(0, 255).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(destino)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("sujeto", help="qué se dibuja")
    p.add_argument("--nombre", required=True, help="nombre base del archivo, sin extensión ni versión")
    p.add_argument("--formato", default="cuadrado 1:1", help="por ejemplo «horizontal 4:3»")
    p.add_argument("--con", default="", help="fichas de referencia: grupo (personas, rostros, mascotas, objetos, escena) o nombres separados por coma")
    a = p.parse_args()

    fichas = fichas_de(a.con)
    original = generar(armar_prompt(a.sujeto, a.formato, len(fichas)), [ANCLA, *fichas])
    n = 1
    while (ILU / f"{a.nombre}-v{n}.png").exists():
        n += 1
    destino = ILU / f"{a.nombre}-v{n}.png"
    quitar_croma(original, destino)
    print(f"Listo: {destino}\nReferencias usadas: ancla + {len(fichas)} fichas\nOriginal sin recortar: {original}")


if __name__ == "__main__":
    main()
