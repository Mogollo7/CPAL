#!/usr/bin/env python3
"""Crea las fichas de referencia (model sheets) del estilo CAPL con Codex.

Uso (desde la raíz del repo):
  python scripts/fichas.py                 # crea las que falten
  python scripts/fichas.py ojos manos      # solo esas
  python scripts/fichas.py ojos --rehacer  # vuelve a generarla (la anterior pasa a <nombre>-anterior.png)

Cada ficha es un catálogo de una parte (ojos, manos, pelo, ropa...) dibujado en el estilo de la ancla.
Luego scripts/ilustrar.py las adjunta con --con, y cada ilustración nueva solo necesita decir qué se dibuja.
"""
import argparse, shutil, sys

from ilustrar import ANCLA, FICHAS, bloque_estilo, generar

FORMATO = "horizontal 3:2"

FICHAS_DESC = {
    "ojos": """Hoja de referencia de OJOS Y CEJAS en una cuadrícula de 4 columnas por 3 filas (12 variantes). Cada celda es solo un par de ojos con sus cejas y un poco de piel alrededor (no la cara completa), todos a la misma escala.
Variantes, en este orden: ojos cerrados en arco sereno (^ ^) · ojos abiertos y grandes sonriendo · mirando hacia arriba con ilusión · mirando de lado con curiosidad · entrecerrados de tanto reír con las mejillas subidas · con gafas redondas de montura fina · con pestañas largas y párpado sombreado · pequeños y tranquilos con ojeras suaves · rasgados con párpado simple · muy abiertos de asombro amable · mirando hacia abajo mientras leen · con brillo cálido de emoción.
Iris en marrón oscuro, avellana y verde azulado; cada pupila con un solo punto de luz crema; cejas hechas con mechones planos en marrón. La sombra del párpado es una mancha plana de un tono más oscuro de la piel. Pieles cálidas y diversas. Nada de lágrimas ni miradas tensas.""",
    "bocas": """Hoja de referencia de BOCAS Y SONRISAS en una cuadrícula de 4 columnas por 3 filas (12 variantes). Cada celda es una boca con labios, un poco de mejilla y mentón, todas a la misma escala.
Variantes: sonrisa abierta con dientes y lengua en manchas planas · sonrisa suave de labios cerrados · risa grande con los ojos cerrados abajo · sonrisa de lado · boca neutra y serena · una «o» de sorpresa amable · boca hablando · sonrisa tímida · bostezo tierno · sonrisa con hoyuelos · sonrisa con bigote y barba · labios muy llenos sonriendo.
Dientes en crema (nunca blanco puro), labios en rosa ciruela y coral suave, comisuras marcadas con un trazo fino marrón, sombra plana bajo el labio inferior. Pieles cálidas y diversas.""",
    "narices": """Hoja de referencia de NARICES en una cuadrícula de 4 columnas por 3 filas (12 variantes), cada una con un poco de mejilla y labio superior para dar contexto, a la misma escala. Mezcla vistas de frente, de tres cuartos y de perfil.
Variantes: nariz mínima en curva pequeña · en «L» suave · pequeña y redonda · respingada · recta y larga · aguileña suave · ancha con fosas marcadas por una mancha plana · con pecas sobre el puente · con sombra plana bajo la punta · de niña o niño, muy pequeña · de persona mayor con arrugas suaves · con aro fino en un lado.
Trazo fino marrón y una mancha plana de un tono más oscuro de la piel para la sombra. Pieles cálidas y diversas. Siempre simples: nada de realismo.""",
    "caras": """Hoja de referencia de ROSTROS COMPLETOS en una cuadrícula de 4 columnas por 3 filas (12 rostros con cuello y hombros), a la misma escala.
Mezcla edades (adolescente, joven, adulta, persona mayor de cabello canoso), pieles cálidas y diversas (miel, canela, café, oliva, rosada clara), y vistas de frente, de tres cuartos, de perfil y mirando hacia arriba. Expresiones: sonrisa abierta, risa, serenidad, curiosidad, ternura, escucha atenta. Rasgos variados: pecas, barba, bigote, gafas redondas, hijab claro, aretes de aro dorado, mechones sobre la frente.
Siempre: rostros grandes y expresivos, mejillas rosadas suaves, ojos pequeños, orejas simples en C, sombra limpia bajo el mentón hecha con una mancha plana.""",
    "pelo": """Hoja de referencia de CABELLO Y PEINADOS en una cuadrícula de 4 columnas por 3 filas (12 cabezas sin rasgos detallados, solo la forma de la cabeza con cuello, mezclando vistas de espaldas y de tres cuartos), a la misma escala.
Peinados: rizos sueltos y abundantes · moño alto desordenado · trenzas · afro redondo · liso corto · melena larga ondulada · cola de caballo · flequillo recto · cabello canoso corto · cabeza rapada con barba · pañuelo o hijab de tela cremosa · cabello recogido con pinza.
Colores: marrón oscuro, castaño, canela, azul noche muy oscuro (nunca negro puro), rubio miel y gris cálido. Cada mechón es una forma plana, con un tono más oscuro para la sombra entre mechones y un reflejo claro corto. Grano visible.""",
    "ropa": """Hoja de referencia de ROPA CÓMODA DE CASA en una cuadrícula de 4 columnas por 3 filas (12 prendas dibujadas sueltas, de frente, como si flotaran, sin cuerpo), a la misma escala.
Prendas: suéter de punto ciruela con cuello de canalé · cárdigan verde azulado con botones · chaqueta de lana mostaza con rayas crema en las mangas · camiseta crema con ribete mostaza en el cuello · camisa abierta verde azulado · jeans azul lavado con dobladillo doblado · pantalón crema ancho · pantalón verde botella · falda larga morada · chaleco acolchado · sudadera lavanda con capucha · pijama de dos piezas.
Telas con grano y puntitos de tejido; los pliegues y arrugas son manchas planas de un tono más oscuro del mismo color, nunca líneas negras; costuras con un trazo fino marrón.""",
    "manos": """Hoja de referencia de MANOS Y GESTOS en una cuadrícula de 4 columnas por 3 filas (12 gestos: manos o pares de manos con un poco de antebrazo y puño de manga), a la misma escala.
Gestos: sostener una taza con ambas manos · señalar hacia arriba · apoyar la mejilla en la mano · tender una mano abierta · dos manos que se sostienen (apoyo) · sostener un teléfono · tocar una tablet con un dedo · escribir en una libreta con lápiz · saludar · mano sobre el pecho · dedos entrelazados sobre las rodillas · regar una planta con una regadera.
Dedos redondeados y sencillos, uñas simples, nudillos con un trazo fino marrón, una mancha plana más oscura bajo cada dedo y en la palma. Pieles cálidas y diversas, mangas de suéter y de chaqueta.""",
    "cuerpos": """Hoja de referencia de CUERPOS Y POSES en una cuadrícula de 4 columnas por 2 filas (8 figuras de cuerpo entero), a la misma escala.
Poses: de pie con mochila y una mano en el bolsillo · sentada en el suelo con las rodillas arriba · recostado de lado apoyado en el codo · sentada en un sillón redondo con una pierna cruzada · caminando sin prisa · abrazando las rodillas · señalando hacia arriba con una pierna levantada, riendo · apoyada en una pared con los brazos cruzados.
Proporciones naturales con cabeza algo grande, ropa cómoda, zapatillas, rostros sencillos y sonrientes. Cuerpos, edades y pieles diversos (incluye una persona con hijab y una persona mayor). Sombra de contacto suave en el suelo.""",
    "accesorios": """Hoja de referencia de ACCESORIOS Y CALZADO en una cuadrícula de 4 columnas por 3 filas (12 objetos sueltos), a la misma escala.
Objetos: zapatillas crema de cordones · zapatillas mostaza de caña alta · zapatillas moradas · reloj de pulsera con correa marrón · aretes de aro dorados · gafas redondas de montura fina · mochila ciruela con bolsillo · bufanda de lana verde azulado · gorro de lana mostaza · bolsa de tela crema · audífonos · termo con tapa.
Mismo grano, bordes redondeados, costuras con trazo fino marrón y una mancha plana más oscura para la sombra de cada pieza.""",
    "mascotas": """Hoja de referencia de GATOS Y PERROS de apoyo en una cuadrícula de 4 columnas por 3 filas (12 poses), a la misma escala.
Poses: gato dormido enroscado en un cojín · gato que se asoma de una caja de cartón · gato sentado con la cola enroscada · gato estirándose · gato tumbado de lado · cachorro con orejas grandes · perro tranquilo echado · perro de orejas caídas sentado · perro con la cabeza apoyada en las patas · perro dormido enroscado · gato mirando por una ventana (solo el cuerpo) · gato y perro juntos.
Pelajes en crema, gris azulado, naranja mostaza, marrón y lavanda suave. Ojos cerrados en arcos felices (◡ ◡) o pequeños y redondos con un punto de luz; mejillas circulares; bigotes con trazo fino marrón; grano visible en el pelaje.""",
    "objetos": """Hoja de referencia de OBJETOS DEL HOGAR en una cuadrícula de 4 columnas por 4 filas (16 objetos sueltos), a la misma escala.
Objetos: taza tibia con vapor suave · tetera · jarra de agua · cojín de tejido grueso · manta doblada · libreta con lápiz · pila de libros · lámpara de mesa de luz cálida · calendario de mesa con la hoja del mes · reloj de pared redondo · teléfono · tablet · laptop abierta · sillón redondo tipo pouf · alfombra redonda tejida · ventana con cortina y luz miel.
Mismo grano, bordes redondeados, costuras y detalles con trazo fino marrón, y una mancha plana de un tono más oscuro para la cara en sombra de cada objeto.""",
    "naturaleza": """Hoja de referencia de PLANTAS, ÁRBOLES Y CASA en una cuadrícula de 4 columnas por 3 filas (12 elementos sueltos), a la misma escala.
Elementos: planta de hojas redondas en maceta morada · planta de hojas largas en maceta crema · helecho en maceta de barro · árbol redondo de copa salvia con tronco ciruela · arbusto redondo · hojas sueltas en mostaza · ramo de flores pequeñas · sendero curvo de tierra clara con hojas · la casa amarilla de dos pisos con puerta redonda, ventana iluminada y tejado con un ave pequeña · nube suave lavanda · banca de madera junto a un árbol · sol cálido con luz miel.
Colores del ancla (ciruela, verde azulado, mostaza, crema), grano visible, bordes redondeados y una mancha plana más oscura para las sombras. Sin cielos ni fondos: cada elemento va aislado.""",
}


def armar(descripcion):
    return f"""Genera UNA imagen con tu herramienta de generación de imágenes (no escribas código, SVG ni archivos).
La imagen adjunta es el ANCLA DE ESTILO: copia su técnica, textura de grano, trazo, rostros, proporciones, tratamiento del color y nivel de detalle. No copies su contenido.

{bloque_estilo()}

Esta imagen es una FICHA DE REFERENCIA permanente (model sheet): un catálogo para que quien dibuje después no olvide cómo se dibuja cada parte en este estilo.
Formato: {FORMATO}.
{descripcion}

Reglas de la ficha: fondo crema plano #FFFBF5; cuadrícula ordenada con mucho aire entre elementos, todos a la misma escala y sin tocarse; ningún marco, tarjeta, número, letra, flecha ni etiqueta; el mismo grano, el mismo trazo marrón suave y las mismas manchas planas de sombra en todos los elementos; diversidad de pieles cálidas (miel, canela, café, oliva, rosado claro), de edades y de rasgos, sin caricatura exagerada; nada de negro puro.

Al terminar responde solo con una línea: la ruta del archivo de la imagen generada."""


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("nombres", nargs="*", help=f"fichas a crear (por defecto, las que falten): {', '.join(FICHAS_DESC)}")
    p.add_argument("--rehacer", action="store_true", help="volver a generar aunque exista")
    a = p.parse_args()
    desconocidas = [n for n in a.nombres if n not in FICHAS_DESC]
    if desconocidas:
        sys.exit(f"No existe la ficha: {', '.join(desconocidas)}. Disponibles: {', '.join(FICHAS_DESC)}")
    FICHAS.mkdir(exist_ok=True)
    for n in a.nombres or FICHAS_DESC:
        destino = FICHAS / f"{n}.png"
        if destino.exists() and not a.rehacer:
            print(f"· {n}: ya existe")
            continue
        if destino.exists():
            shutil.move(destino, FICHAS / f"{n}-anterior.png")
        print(f"· {n}: generando…", flush=True)
        shutil.copy(generar(armar(FICHAS_DESC[n]), [ANCLA]), destino)
        print(f"  listo: {destino}", flush=True)


if __name__ == "__main__":
    main()
