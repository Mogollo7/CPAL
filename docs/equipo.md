← [README](../README.md) · [Anterior: Diseño](diseno.md)

# Equipo y forma de trabajo

<p align="center"><img src="img/doc-equipo.webp" alt="" width="70%"></p>

| Integrante                                                             | Rol                                            | Carpetas                                                                                       | Rama        |
| ---------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------- |
| [Juan Sebastián Martínez Galeano](https://github.com/Mogollo7) (Sebas) | Líder técnico y diseño UI/UX en Figma          | `servidor/`, `contratos/`, `prisma/`, `correos/`, `infra/`, `estilos/`, `app/api/`, `.github/` | `dev/sebas` |
| [Samuel Usma](https://github.com/Brandsete) (Brand)                    | Paneles y gestión                              | `app/(panel)/`, `componentes/panel/`                                                           | `dev/brand` |
| [César Ocampo Raigosa](https://github.com/Cesar-csr)                   | Sitio público y emergencias                    | `app/(publico)/`, `componentes/publico/`, `componentes/ui/`, `contenido/`                      | `dev/cesar` |
| Gemini                                                                 | Colaborador IA: neurodiseño y revisión técnica | `cerebro/normas/` y apoyo transversal                                                          | —           |

## Protocolo

| Tema              | Regla                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------- |
| `main`            | Siempre funcional; solo recibe cambios por PR con CI en verde                         |
| Commits           | `vX.Y.Z tipo(ID): qué cambia` (X unión a `main`, Y push, Z commit local)              |
| Guardar           | `npm run guardar -- <tipo> <ID> "<mensaje>"`                                          |
| Subir             | `npm run subir -- <tipo> <ID> "<mensaje>"` corre lint, tipos y pruebas antes del push |
| Contratos y datos | Primero el esquema en `contratos/`; una migración ya unida no se edita                |
| Secretos y datos  | Nunca llaves ni datos reales de pacientes en el repositorio                           |

Fuente detallada: [División del trabajo](../cerebro/06-Division-del-Trabajo.md) · [Protocolo de equipo](../cerebro/07-Protocolo-de-Equipo.md)
