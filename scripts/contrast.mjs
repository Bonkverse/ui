#!/usr/bin/env node
// Checks every text/background and control/background pair in tokens.css,
// in all three themes, against WCAG 2.2 AA:
//   4.5:1 for text, 3:1 for large text and for boundaries you need to see
//   (control borders, the focus ring).
// Exits 1 if any pair falls short. CI runs this on every push.
//
//   node scripts/contrast.mjs            table of every pair
//   node scripts/contrast.mjs --failing  only the ones that fail

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const TEXT = 4.5;
const NON_TEXT = 3;

// [foreground, background, minimum, where you see it]
const PAIRS = [
  ["text", "page", TEXT, "body text"],
  ["text", "card", TEXT, "card text"],
  ["text", "thumb", TEXT, "text on the artwork stage, code"],
  ["text", "input", TEXT, "typed text"],
  ["text", "selected", TEXT, "selected vote, chip, menu item"],
  ["text", "success", TEXT, "✓ Applied, success notice"],
  ["text", "danger-surface", TEXT, "error notice text"],
  ["muted", "page", TEXT, "secondary text"],
  ["muted", "card", TEXT, "creator, metadata on cards"],
  ["muted", "thumb", TEXT, "Enlarge, favorite count"],
  ["muted", "input", TEXT, "placeholder"],
  ["heading", "page", TEXT, "page and section titles"],
  ["heading", "card", TEXT, "card titles"],
  ["link", "page", TEXT, "links"],
  ["link", "card", TEXT, "Skin details, ghost buttons"],
  ["link", "thumb", TEXT, "links in code blocks"],
  ["link", "input", TEXT, "Search action"],
  ["link", "search-action", TEXT, "Search action (Light fill)"],
  ["link", "search-action-hover", TEXT, "Search action, hover"],
  ["link", "success", TEXT, "success status"],
  ["link", "selected", TEXT, "selected tab or chip mark"],
  ["text", "hover", TEXT, "anything under the pointer"],
  ["link", "hover", TEXT, "ghost button or link, hover"],
  ["danger-ink", "danger-solid", TEXT, "Delete, Revoke"],
  ["danger-ink", "danger-solid-hover", TEXT, "Delete, hover"],
  ["danger-ink", "danger-solid-pressed", TEXT, "Delete, pressed"],
  ["link", "card", NON_TEXT, "selected border on a card"],
  ["text", "card", NON_TEXT, "hovered control border"],
  ["action-ink", "action", TEXT, "Wear, Create key"],
  ["action-ink", "action-hover", TEXT, "main action, hover"],
  ["action-ink", "action-pressed", TEXT, "main action, pressed"],
  ["gold", "thumb", TEXT, "favorited star and count"],
  ["gold", "card", TEXT, "favorited count on cards"],
  ["danger", "page", TEXT, "error text"],
  ["danger", "card", TEXT, "Revoke, field errors"],
  ["danger", "danger-surface", TEXT, "danger button hover, error notice"],
  ["header-title", "header", TEXT, "header links"],
  ["header-meta", "header", TEXT, "theme picker label"],
  ["header-link", "header", TEXT, "current site in the header"],
  ["control", "page", NON_TEXT, "button and field borders"],
  ["control", "card", NON_TEXT, "button and field borders on cards"],
  ["control", "input", NON_TEXT, "field border against its fill"],
  ["link", "page", NON_TEXT, "focus ring"],
  ["danger", "input", NON_TEXT, "invalid field border"],
];

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "..", "tokens.css"), "utf8");

function themeBlock(selectorPattern) {
  const match = css.match(new RegExp(selectorPattern + "\\s*\\{([^}]*)\\}"));
  if (!match) throw new Error(`No block for ${selectorPattern} in tokens.css`);
  const vars = {};
  for (const [, name, value] of match[1].matchAll(/--bv-([\w-]+):\s*([^;]+);/g)) {
    vars[name] = value.trim();
  }
  return vars;
}

const THEMES = {
  Bonkverse: themeBlock('\\[data-bv-theme="bonkverse"\\]'),
  Light: themeBlock('\\[data-bv-theme="light"\\]'),
  Dark: themeBlock('\\[data-bv-theme="dark"\\]'),
};

function rgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
}

function luminance(hex) {
  const [r, g, b] = rgb(hex).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const onlyFailing = process.argv.includes("--failing");
let failures = 0;
let checked = 0;
const rows = [];

for (const [theme, vars] of Object.entries(THEMES)) {
  for (const [fg, bg, min, where] of PAIRS) {
    const a = vars[fg];
    const b = vars[bg];
    if (!a || !b) throw new Error(`${theme}: missing --bv-${!a ? fg : bg}`);
    // "transparent" search action: the button sits on the input fill.
    if (b === "transparent") continue;
    const r = ratio(a, b);
    const ok = r >= min;
    checked++;
    if (!ok) failures++;
    if (!onlyFailing || !ok) {
      rows.push(
        `${ok ? "pass" : "FAIL"}  ${theme.padEnd(9)}  ${r.toFixed(2).padStart(5)}:1  (min ${min})  ` +
          `${fg} ${a} on ${bg} ${b}  — ${where}`,
      );
    }
  }
}

console.log(rows.join("\n"));
console.log(`\n${checked} pairs checked across ${Object.keys(THEMES).length} themes, ${failures} failing.`);
process.exit(failures ? 1 : 0);
