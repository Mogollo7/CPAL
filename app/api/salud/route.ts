// Monitor externo (S06). Sin detalle. La comprobación de BD (SELECT 1) se añade con Prisma.
export function GET() {
  return Response.json({ estado: "ok" });
}
