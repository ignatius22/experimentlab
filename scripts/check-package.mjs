// Run from a package folder after building. Fails if package.json points at a file the
// build didn't produce, then loads the package both ways (require and import) as an app would.
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const dir = process.cwd();
const pkg = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8"));
const targets = new Set([pkg.main, pkg.module, pkg.types].filter(Boolean));
const walk = (v) => (typeof v === "string" ? targets.add(v) : v && Object.values(v).forEach(walk));
walk(pkg.exports);

const missing = [...targets].filter((t) => !existsSync(path.join(dir, t)));
if (missing.length) {
  console.error(`${pkg.name}: package.json points at files the build didn't produce: ${missing.join(", ")}`);
  process.exit(1);
}

createRequire(path.join(dir, "package.json"))(path.join(dir, pkg.exports["."].require.default));
await import(pathToFileURL(path.join(dir, pkg.exports["."].import.default)).href);
console.log(`${pkg.name}@${pkg.version}: entry points OK`);
