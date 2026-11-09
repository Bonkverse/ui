# Bonkverse UI

The shared look of every Bonkverse site: bonkverse.io, the replay site, the docs and the developer portal. One set of colors in three themes, one font, one header, one skin card.

It's plain CSS, two small scripts and one JSON file, with no build step, so a Django template can use it as easily as a React app.

**Gallery:** https://bonkverse.github.io/ui/ shows every component in all three themes. Check it before tagging a release.

Decided in RFC-0002 ("One Bonkverse look"). Colors and the skin card come from the Skin card design guide.

## What's here

| File | What it's for |
|---|---|
| `tokens.css` | Colors for the three themes (Bonkverse, Bonkverse Light, Bonkverse Dark), plus type sizes, spacing, corners and motion timings |
| `base.css` | Jost, the page background, text, links, the focus ring, `.bv-visually-hidden`, reduced motion |
| `components.css` | Header and footer, page header, buttons, menus, skin card and grid, skin details, inputs and search, tabs, chips, pills, tables, notices, toasts, dialogs, empty and loading states, code blocks |
| `theme.js` | Applies the saved theme before the page paints, and runs the theme picker |
| `ui.js` | Menus, the phone menu, dialogs, copy buttons and toasts |
| `nav.json` | The header, skin tabs, account menu and footer links. Every site renders its header from this |
| `fonts/` | Jost 400, 500, 600 and 700 (Latin and Latin Extended), with its licence (`OFL.txt`) |
| `img/planet.png` | The Bonkverse planet for the header |
| `index.html` | The gallery |
| `scripts/contrast.mjs` | Checks every text and border color pair in all three themes against WCAG AA. CI fails a change that breaks one |
| `scripts/responsive.mjs` | Opens the gallery at 21 sizes, from a 280 px folded phone to a 3,440 px ultrawide, in all three themes, with menus, dialogs and toasts open. It fails on sideways scrolling, anything off screen, cut-off text, a control under 44 px, or a dialog that doesn't fit. 1,280 px at 200% zoom is the 640 px size |

## Using it on a page

Order matters: `theme.js` goes first, before any stylesheet, and without `defer`.

```html
<meta name="theme-color" content="#2a4054">
<script src="/static/ui/theme.js"></script>
<link rel="stylesheet" href="/static/ui/tokens.css">
<link rel="stylesheet" href="/static/ui/base.css">
<link rel="stylesheet" href="/static/ui/components.css">
<script src="/static/ui/ui.js" defer></script>
```

Fonts load from `fonts/` next to `base.css`, so keep the folder layout as it is.

### bonkverse.io (Django)

Copy a tagged release into `skins/static/ui/` with the copy script in the bonkverse repo, and commit the files. Nobody edits those files by hand; a test checks they match the pinned release. The header is a `_site_header.html` partial built from `nav.json`.

### Replays (Vite and React) and the docs (Docusaurus)

```bash
npm install github:Bonkverse/ui#v0.1.0
```

```js
import "@bonkverse/ui/tokens.css";
import "@bonkverse/ui/base.css";
import "@bonkverse/ui/components.css";
import nav from "@bonkverse/ui/nav.json";
```

`theme.js` still has to run before paint. Inline it in `index.html` (Vite), or add it to `headTags` / `scripts` in `docusaurus.config.ts`.

Docusaurus puts its own `data-theme` on `<html>`, which is why these themes use `data-bv-theme`. In the docs, `custom.css` maps Docusaurus's `--ifm-*` variables onto the `--bv-*` ones, and its own colour-mode switch stays off.

## Themes

| | Bonkverse (default) | Bonkverse Light | Bonkverse Dark |
|---|---|---|---|
| Page | `#192630` | `#D5DFE4` | `#080809` |
| Card | `#263845` | `#EFEEE9` | `#161719` |
| Text | `#E7ECEE` | `#2A4054` | `#E7ECEE` |
| Links and focus | `#8BD2C5` | `#15534C` | `#8BD2C5` |
| Main action | `#79554A` | `#79554A` | `#79554A` |

The full list is in `tokens.css`, and the gallery shows the current theme's swatches.

- New visitors get **Bonkverse**, whatever their device is set to.
- The picker is any `<select data-bv-theme-picker>` with the options `bonkverse`, `light` and `dark`.
- The choice is saved in a cookie on `.bonkverse.io`, so it follows the person across bonkverse.io, replays and docs. It's also kept in `localStorage` as a backup, and for localhost.
- `data-bv-theme` also works on any element, which then shows that theme inside it. The gallery uses this to compare themes side by side.
- From a script: `BonkverseTheme.get()`, `BonkverseTheme.set("dark")`, and the `bv:themechange` event.

## Rules the components follow

These come from the design guide. Keep to them when adding components.

- **Colors.** Components use `--bv-*` roles, never hex values.
- **Brown.** One brown main action per screen or card (Wear, Create key). Everything else is secondary, ghost or danger.
- **Gold.** Gold is for favorites only.
- **Tap targets.** Every control is at least 44 × 44 px. Rows wrap rather than shrink a button.
- **Any screen size.** Nothing sets a width the screen can't shrink below. Single-column grids use `minmax(0, 1fr)`, and inputs inside flex rows get `width: 0; flex: 1`. Wide things (tables, tab rows, code) scroll inside their own box, never the page. Wide screens cap reading widths (forms 480 px, notices 720 px, the page 1,280 px). `scripts/responsive.mjs` must pass.
- **Focus.** A 2 px teal ring, 2 px away from the element, everywhere.
- **Text wraps.** Skin names and creator names wrap. They're never cut off with `…`.
- **Motion.** Motion is short (110–250 ms) and only shows a change. Under `prefers-reduced-motion` it goes, and the state change still happens.
- **Feedback.** Feedback goes next to the action (`.bv-status` under the row, with `role="status"`). Toasts are for things with no place on the page. Errors stay until they're dismissed.
- **Class names.** Every class starts with `bv-`, so nothing collides with a site's own classes, Docusaurus's, or the old `pv-` ones.

## Releasing

1. Make the change, open a PR, and check the gallery in all three themes at 375 px and 1,280 px. The PR's checks run the contrast script.
2. Bump the version in `package.json`, `nav.json`, the header comment of each CSS and JS file, and `index.html`, then add a `CHANGELOG.md` entry. `node scripts/check-version.mjs` catches a file you missed.
3. Merge, then tag: `git tag v0.2.0 && git push origin v0.2.0`.
4. Upgrade each site in its own PR, with before and after screenshots.

Breaking changes (a renamed class or token) bump the minor version while we're below 1.0, and the changelog says what to rename.

## Checks

```bash
node scripts/contrast.mjs            # every pair, with ratios
node scripts/contrast.mjs --failing  # only failures
node scripts/check-version.mjs
node scripts/responsive.mjs         # needs: npm install --no-save playwright && npx playwright install chromium
python3 -m http.server 8000          # then open http://localhost:8000
```

## Licences

Jost is by the Jost Project Authors, under the SIL Open Font License 1.1 (`fonts/OFL.txt`). The sample skins in `img/samples/` were drawn for this gallery.
