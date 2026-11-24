Dueño: Sebas (plantillas de correo).

## Imágenes de los correos

Las imágenes de `public/correos/` se incrustan como adjuntos inline con
`Content-ID` al enviar por Resend. El HTML usa `cid:...`, por lo que el buzón
no depende del subdominio, del túnel o de que el cliente permita descargar
imágenes remotas. Las plantillas publicadas y el HTML de respaldo usan los
mismos identificadores CID.

Después de cambiar una ilustración o el diseño de una plantilla, despliega primero la aplicación y luego
ejecuta `npm run resend:plantillas` con el `.env` del entorno. Finalmente envía
un correo de prueba al buzón de desvío. La publicación debe hacerse después
del despliegue para que el HTML de respaldo y la plantilla queden alineados.

## Adjuntos de calendario

Las confirmaciones de citas e inscripciones llevan un archivo `.ics` con hora UTC
que Resend envía como adjunto `application/octet-stream`. Outlook puede descargarlo
para importarlo desde el calendario. El correo de cita también ofrece enlaces para
Google Calendar, Outlook institucional (Microsoft 365) y Outlook personal.
