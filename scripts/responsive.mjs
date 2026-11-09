#!/usr/bin/env node
// Opens the gallery at every width from a folding phone to an ultrawide
// monitor, in each theme, with menus and dialogs open and closed, and fails
// if anything:
//   - makes the page scroll sideways,
//   - sticks out past the edge of the screen,
//   - has its text cut off (clipped instead of wrapping),
//   - is a control smaller than 44 × 44 px (the guide's tap target),
//   - shows a dialog taller or wider than the screen.
// Short landscape phones are included, and 200% browser zoom is the same as
// half the width, which the list covers (1280 px at 200% = 640 px).
//
//   npm install --no-save playwright && npx playwright install chromium
//   node scripts/responsive.mjs            # starts its own server
//   node scripts/responsive.mjs --shots    # also saves screenshots to shots/

import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join, dirname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHOTS = process.argv.includes("--shots");

const VIEWPORTS = [
  [280, 653, "folded phone"],
  [320, 568, "small phone"],
  [360, 740, "Android phone"],
  [375, 667, "iPhone SE"],
  [390, 844, "iPhone"],
  [430, 932, "large phone"],
  [568, 320, "small phone, landscape"],
  [667, 375, "phone, landscape"],
  [600, 900, "two-column breakpoint"],
  [640, 800, "1280 px at 200% zoom"],
  [768, 1024, "tablet"],
  [899, 900, "just under 900"],
  [900, 900, "three-column breakpoint"],
  [1024, 768, "tablet, landscape"],
  [1199, 900, "just under 1200"],
  [1200, 900, "four-column breakpoint"],
  [1280, 800, "laptop"],
  [1440, 900, "desktop"],
  [1920, 1080, "full HD"],
  [2560, 1440, "1440p"],
  [3440, 1440, "ultrawide"],
];
const THEMES = ["bonkverse", "light", "dark"];

// Containers that scroll sideways on purpose; what's inside them may be wider.
const SCROLLERS = ".bv-table-wrap, .bv-tabs, .bv-code pre, .g-markup pre";
// Controls that must meet the 44 px target.
const CONTROLS = [
  ".bv-btn", ".bv-header__link", ".bv-header__brand", ".bv-menu__item", ".bv-tab",
  ".bv-details-link", ".bv-back", ".bv-fav", ".bv-check", ".bv-theme-picker select",
  ".bv-input", ".bv-select", ".bv-search", ".bv-search button",
].join(", ");

// ── Tiny static server for the repo ──────────────────────────────────────────
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  try {
    const body = await readFile(join(root, path === "/" ? "index.html" : path));
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/index.html`;

// ── Checks that run inside the page ──────────────────────────────────────────
function audit({ SCROLLERS, CONTROLS }) {
  const problems = [];
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const name = (el) => {
    const label = (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return `${el.tagName.toLowerCase()}.${[...el.classList].join(".")}${label ? ` “${label}”` : ""}`;
  };
  const visible = (el) => {
    if (el.closest("[hidden], dialog:not([open]), template, [aria-hidden='true'] .bv-skeleton")) return false;
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  if (document.documentElement.scrollWidth > vw + 1) {
    problems.push(`page scrolls sideways: ${document.documentElement.scrollWidth}px wide in a ${vw}px window`);
  }

  for (const el of document.body.querySelectorAll("*")) {
    if (!visible(el) || el.closest(SCROLLERS) || el.closest(".bv-visually-hidden, .bv-skip-link")) continue;
    if (el.matches("svg *, svg, i")) continue;
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 || r.left < -1) {
      problems.push(`off screen (${Math.round(r.left)}→${Math.round(r.right)} of ${vw}): ${name(el)}`);
    }
    const s = getComputedStyle(el);
    const clips = ["hidden", "clip"].includes(s.overflowX) || s.textOverflow === "ellipsis";
    if (clips && el.scrollWidth > el.clientWidth + 1 && !el.matches(".bv-skin-card, .bv-skeleton, .bv-visually-hidden")) {
      problems.push(`text cut off (${el.scrollWidth} > ${el.clientWidth}): ${name(el)}`);
    }
  }

  for (const el of document.querySelectorAll(CONTROLS)) {
    if (!visible(el) || el.closest("[aria-hidden='true']")) continue;
    const r = el.getBoundingClientRect();
    if (r.height < 43.5 || r.width < 43.5) {
      problems.push(`target ${Math.round(r.width)}×${Math.round(r.height)} under 44: ${name(el)}`);
    }
  }

  for (const d of document.querySelectorAll("dialog[open]")) {
    const r = d.getBoundingClientRect();
    if (r.width > vw || r.height > vh + 1 || r.top < -1 || r.left < -1) {
      problems.push(`dialog doesn't fit (${Math.round(r.width)}×${Math.round(r.height)} in ${vw}×${vh}): #${d.id}`);
    }
  }
  return problems;
}

// ── The states to check at each size ─────────────────────────────────────────
const STATES = {
  "page": async () => {},
  "phone menu and Tools open": async (page) => {
    await page.evaluate(() => {
      const menuBtn = document.querySelector(".bv-header__menu-btn");
      if (getComputedStyle(menuBtn).display !== "none") menuBtn.click();
      document.querySelector('[aria-controls="tools-menu"]').click();
    });
  },
  "overflow menu open": async (page) => {
    await page.evaluate(() => {
      const button = document.querySelector('[aria-controls="overflow"]');
      button.scrollIntoView({ block: "center" });
      button.click();
    });
  },
  "zoom dialog": async (page) => {
    await page.evaluate(() => document.getElementById("zoom").showModal());
  },
  "report dialog": async (page) => {
    await page.evaluate(() => document.getElementById("report").showModal());
  },
  "toasts": async (page) => {
    await page.evaluate(() => {
      BonkverseUI.toast("Link copied", "success");
      BonkverseUI.toast("Couldn't save your vote. Check your connection and try again.", "error");
    });
  },
};

const browser = await chromium.launch();
let failures = 0;
let runs = 0;
if (SHOTS) await mkdir(join(root, "shots"), { recursive: true });

for (const theme of THEMES) {
  for (const [width, height, label] of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
    await context.addInitScript((t) => { try { localStorage.setItem("bv-theme", t); } catch {} }, theme);
    for (const [state, setUp] of Object.entries(STATES)) {
      // Layout doesn't change with the theme, so the extra states run in the default theme only.
      if (theme !== "bonkverse" && state !== "page") continue;
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(base);
      await page.evaluate(() => document.fonts.ready);
      await setUp(page);
      await page.waitForTimeout(50);
      const problems = [...errors.map((e) => `script error: ${e}`), ...(await page.evaluate(audit, { SCROLLERS, CONTROLS }))];
      runs++;
      if (problems.length) {
        failures += problems.length;
        console.log(`\n✗ ${theme} · ${width}×${height} (${label}) · ${state}`);
        for (const p of [...new Set(problems)]) console.log(`    ${p}`);
      }
      if (SHOTS && state === "page") {
        await page.screenshot({ path: join(root, "shots", `${theme}-${width}.png`), fullPage: true });
      }
      await page.close();
    }
    await context.close();
  }
}

await browser.close();
server.close();
console.log(`\n${runs} checks (${VIEWPORTS.length} sizes × ${THEMES.length} themes, plus menus, dialogs and toasts), ${failures} problems.`);
process.exit(failures ? 1 : 0);
