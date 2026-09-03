// ============================================================
// Auditor de imports de hooks de react-router
// Detecta archivos que usan un hook pero no lo importan.
// Uso:  node scripts/audit-react-router-hooks.cjs
// ============================================================

const fs = require("fs");
const path = require("path");

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const HOOKS = ["useNavigate", "useLocation", "useSearchParams", "useParams", "useMatch", "useRoutes"];
const root = path.join("src", "app");
const errors = [];

for (const file of walk(root)) {
  // Leemos sin comentarios para evitar falsos positivos (palabras en
  // comentarios como 'useLocation() requiere...' no cuentan).
  const raw = fs.readFileSync(file, "utf8");
  // Elimina comentarios de bloque /* ... */ antes de buscar.
  const content = raw.replace(/\/\*[\s\S]*?\*\//g, "");
  const used = HOOKS.filter((h) => new RegExp(`\\b${h}\\b`).test(content));
  if (used.length === 0) continue;

  const fullImport = content.match(/import\s*\{([^}]+)\}\s*from\s+['"]react-router['"]/);
  if (!fullImport) {
    errors.push(`${path.basename(file)}: USA ${used.join(",")} pero NO IMPORTA de react-router`);
    continue;
  }
  const imported = new Set(fullImport[1].split(",").map((s) => s.trim()).filter(Boolean));
  const missing = used.filter((h) => !imported.has(h));
  if (missing.length > 0) {
    errors.push(`${path.basename(file)}: FALTA importar ${missing.join(",")} de react-router`);
  }
}

if (errors.length === 0) {
  console.log("OK: todos los hooks de react-router están importados correctamente");
  process.exit(0);
} else {
  console.error("ENCONTRADOS " + errors.length + " archivos con imports faltantes:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
