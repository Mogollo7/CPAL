# Ritmo visual del sitio público CAPL

Referencia de distribución: [inicio de Duolingo](https://www.duolingo.com/). Se inspeccionaron capturas completas en Chrome a 390 × 844 y 1440 × 900. En la captura móvil, la primera fila temática empieza alrededor de 940 px. Las filas de muestra miden entre 611 y 635 px y tienen unas 96 px de separación. En escritorio, las filas comparadas miden alrededor de 530 px y alternan la posición del texto y la ilustración. Son medidas de esa captura.

## Criterio para el CAPL

- Conservar Nunito, los colores crema y lavanda, la estrella amarilla y las ilustraciones propias. Los párrafos usan el tamaño base de 16 px y el interlineado 1,618. Las bajadas se limitan con un ancho máximo de lectura.
- En móvil, agrupar una idea, su texto y su ilustración. Reservar espacio para la imagen, limitar su ancho y colocar las acciones en el flujo debajo del contenido. Separar bloques con espacio vertical adaptable.
- Usar `escena-inicial` para una portada que ocupe aproximadamente la primera pantalla y `fila-editorial` para una fila de contenido que pueda crecer con el texto o con el zoom. `Seccion ritmo="editorial"` aplica esa fila en las páginas públicas.
- En Inicio, el arte `hero-fondo-*.webp` ocupa un espacio propio arriba del texto en móvil. En Cómo funciona, `comunidad-psicologia.webp` precede a «Únetenos». En Contacto, el encabezado, los retratos y la estrella comparten el mismo fondo lavanda.

## Auditoría para seguir ajustando

| Página | Observación en móvil | Dónde se ajusta |
| --- | --- | --- |
| Inicio | «Pedir ayuda puede ser sencillo» queda después de la primera pantalla. Los pasos tienen texto e imagen agrupados. | `HeroCarrusel`, `PasosCita` y `FilaIlustrada` |
| Contacto | «Contacta con nosotros» queda centrado y la estrella con «Contáctanos» permanece dentro del difuminado. Los canales y la ubicación empiezan en bloques posteriores. | `app/(publico)/contacto/page.tsx` y `CarruselPerfiles` |
| Cómo funciona | «Únetenos» se lee y se toca debajo de la ilustración, en el flujo de la página. | `app/(publico)/como-funciona/page.tsx` |
| Servicios | En la muestra de 390 × 844, la primera ficha ya empieza dentro de la portada. Una separación mayor conviene si se quiere dedicar la primera pantalla a la introducción. | `CabeceraIlustrada` y las filas en `app/(publico)/servicios/page.tsx` |
| Equipo | En la misma muestra, «Conoce a quienes te acompañan» aparece antes de terminar la primera pantalla. La altura del retrato de portada define esa transición. | `app/(publico)/equipo/page.tsx` |
| Eventos | La transición depende del destacado. Conviene revisar la distribución con un evento publicado, con un título largo y con la cartelera vacía. | `Destacado` y `Agenda` en `app/(publico)/eventos/page.tsx` |

Para revisar otra página, recorrerla a 320, 390 y 430 px. Comprobar que un título llega acompañado de su contenido, que la imagen conserva su proporción y que ninguna acción de lectura queda cubierta por el botón flotante de ayuda. En Ayuda inmediata se mantiene primero el acceso a los recursos de urgencia.
