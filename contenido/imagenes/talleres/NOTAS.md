# Tratamiento de imágenes de talleres

Para Gabriel: las tres imágenes de esta carpeta son referencias suministradas para el diseño. El filtro es visual y se aplica a cualquier imagen del taller sin modificar el archivo original.

La clase global `capl-imagen-taller` espera una imagen `img` como hija directa y el contenido textual como hermanos posteriores. Asigna una altura o relación de aspecto a la tarjeta. El tinte predeterminado es morado; `data-tinte="agua"` y `data-tinte="amarillo"` seleccionan los otros tonos. El título y los detalles deben permanecer visibles sin depender de hover; una tarjeta con destino debe usar un enlace accesible.

La carga y almacenamiento de imágenes, los textos alternativos, las imágenes de respaldo y la conexión de esta clase con los datos de eventos aún deben implementarse en el flujo de talleres. Verificar contraste con cada fotografía, navegación con teclado, móvil y colores forzados; no asumir que todas las imágenes necesitan el mismo recorte. El uso final de las fotos de referencia queda sujeto a que el equipo disponga de los derechos correspondientes.

En Figma el filtro está representado por una imagen desaturada, una capa de tinte en multiplicar y un degradado oscuro para el texto. Al reemplazar una imagen, se cambia la capa `IMAGEN` de la variante de reposo; los detalles permanecen visibles.
