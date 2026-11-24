const fmt = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "America/Bogota",
});
export const fechaHora = (iso: string) => fmt.format(new Date(iso));
