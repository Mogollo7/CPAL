// Protocolo de commits (cerebro/07 §2). Calcula solo la versión vX.Y.Z para que nadie la escriba a mano.
//   npm run guardar -- feat T-201 "qué cambia"   → commit LOCAL (Z+1). Rápido, sin comprobaciones: se usa muy seguido.
//   npm run subir   -- feat T-201 "qué cambia"   → commit + comprobaciones + push (Y+1, Z=0). Abre/actualiza el PR.
// Sin mensaje en `subir`: solo comprueba y sube lo que ya está commiteado.
import { execFileSync, spawnSync } from "node:child_process";

const git = (...a) => execFileSync("git", a, { encoding: "utf8" }).trim();
const [modo, tipo, id, ...resto] = process.argv.slice(2);
const TIPOS = ["feat", "fix", "docs", "style", "refactor", "test", "chore"];
const salir = (m) => (console.error(`✖ ${m}`), process.exit(1));

if (!["local", "subir"].includes(modo)) salir("Modo desconocido.");
const rama = git("branch", "--show-current");
if (rama === "main")
  salir(
    "main está protegida: trabaja en tu rama (dev/sebas, dev/brand, dev/cesar).",
  );

// Versión del último commit de ESTA rama que traiga etiqueta.
const ultima = git("log", "--format=%s", "-n", "200")
  .split("\n")
  .map((s) => s.match(/^v(\d+)\.(\d+)\.(\d+)/))
  .find(Boolean);
const [X, Y, Z] = ultima ? ultima.slice(1).map(Number) : [0, 0, 0];

const hayCambios = git("status", "--porcelain") !== "";
const mensaje = resto.join(" ").trim();

if (hayCambios) {
  if (!TIPOS.includes(tipo) || !id || !mensaje)
    salir(
      `Uso: npm run ${modo === "local" ? "guardar" : "subir"} -- <${TIPOS.join("|")}> <ID> "qué cambia"`,
    );
  const version = modo === "local" ? `v${X}.${Y}.${Z + 1}` : `v${X}.${Y + 1}.0`;
  git("add", "-A");
  git("commit", "-m", `${version} ${tipo}(${id}): ${mensaje}`);
  console.log(`✔ ${version} ${tipo}(${id}): ${mensaje}`);
} else if (modo === "local") {
  console.log("Nada que guardar: no hay cambios.");
}

if (modo === "subir") {
  for (const paso of ["lint", "tipos", "pruebas"]) {
    console.log(`… npm run ${paso}`);
    if (
      spawnSync("npm", ["run", "-s", paso], { stdio: "inherit", shell: true })
        .status !== 0
    )
      salir(
        `Falló "${paso}". El commit local SÍ quedó guardado; corrige y vuelve a ejecutar npm run subir.`,
      );
  }
  execFileSync("git", ["push", "-u", "origin", rama], { stdio: "inherit" });
  console.log(`✔ Subido a origin/${rama}. Avisa el PR en el chat.`);
}
