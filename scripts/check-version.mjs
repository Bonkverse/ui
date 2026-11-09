#!/usr/bin/env node
// Every file that names the version must name the same one as package.json,
// so a site can tell from any file which release it has.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");
const version = JSON.parse(read("package.json")).version;
const want = `v${version}`;

const checks = {
  "nav.json": JSON.parse(read("nav.json")).version === version,
  "tokens.css": read("tokens.css").includes(`(${want})`),
  "base.css": read("base.css").includes(`(${want})`),
  "components.css": read("components.css").includes(`(${want})`),
  "theme.js": read("theme.js").includes(`(${want})`),
  "ui.js": read("ui.js").includes(`(${want})`),
  "index.html": read("index.html").includes(want),
  "CHANGELOG.md": read("CHANGELOG.md").includes(`## ${version}`),
};

const wrong = Object.entries(checks).filter(([, ok]) => !ok).map(([f]) => f);
if (wrong.length) {
  console.error(`These don't say ${want} (package.json's version): ${wrong.join(", ")}`);
  process.exit(1);
}
console.log(`All files say ${want}.`);
