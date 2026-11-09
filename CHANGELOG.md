# Changelog

Sites pin a tag (`v0.1.0`). Each entry says what changed and what a site has to do when it upgrades.

## 0.1.2 (2026-11-09)

From the first review of bonkverse.io on the package.

- **Enlarge.** On search cards, clicking "Enlarge" made the label jump to the middle of the card and did nothing. Now the whole artwork area is the button, so the label and the space around the circle open it too, and only the image moves on press. The image also grows slightly on hover, so it reads as clickable.
- **Full size.** The Enlarge dialog has a **Full size** button (`data-bv-zoom-full`, handled by `ui.js`) that fills the screen with the image, up to its real size. Closing the dialog resets it.
- **Skin details.** The layout is centered and wider (240 px artwork from 900 px). Wear has a sensible width instead of filling the row. **Open in** and **···** are gone: Copy link, Skin editor, Bonkleagues, Re-render and Report are labeled buttons in one row (`.bv-skin-detail__tools`, replacing `__more`).
- **Header account.** The name links to your profile, and a separate chevron button opens the account menu (`.bv-header__account`). Only chevrons turn when a menu opens (`.bv-chevron`, or Lucide's `chevron-down`). Before, every icon in the button turned.
- **Logo.** The purple planet (`img/logo.png`) replaces the old `img/planet.png`.
- **Autofill.** Fields the browser fills in keep the theme's colors instead of turning yellow.
- **Footer.** Less padding. `<body class="bv-app">` keeps it at the bottom of short pages.
- **Code blocks.** An optional bar shows a label and the Copy button (`.bv-code__bar`). Tabs switch between languages (`[role=tablist][data-bv-tabs]` in `ui.js`), and the chosen language is remembered across the site.

Upgrading:
- Rename `bv-skin-detail__more` to `__tools`.
- Use the `bv-header__account` markup.
- Point the logo at `img/logo.png`.

## 0.1.1 (2026-11-09)

- **Fix:** in the phone menu, the account menu (and any other menu in the header's end area) opened as a floating box that the scrolling menu cut off. Menus inside the phone menu now open in place, on a full-width line. Found while moving bonkverse.io onto this package.
- **Gallery:** the header shows the signed-in account menu. `scripts/responsive.mjs` opens it on every size and now fails when an open menu is clipped by a scrolling parent.

Upgrading: no markup changes.

## 0.1.0 (2026-11-09)

The first release.

- **Themes.** Three themes from the Skin card design guide: Bonkverse (default), Bonkverse Light and Bonkverse Dark, set with `data-bv-theme`. Danger red is an addition to the guide.
- **Theme picker.** `theme.js` applies the saved theme before paint and runs any `<select data-bv-theme-picker>`. The choice is shared across `*.bonkverse.io` through a cookie.
- **Font.** Jost 400, 500, 600 and 700, self-hosted with the OFL licence. It replaces Futura PT, which is a commercial font.
- **Components.** Header, footer, page header, buttons, menus, skin card and grid, skin details, inputs and search, tabs, chips, pills, tables, pagination, notices, toasts, dialogs, empty and loading states, and code blocks.
- **Behavior.** `ui.js` runs menus, the phone menu, dialogs, copy buttons and toasts.
- **Navigation.** `nav.json` holds the header (Skins, Replays, Players, Tools, Developers), the skin tabs, the account menu and the footer.
- **Gallery.** `index.html` shows every component, published to GitHub Pages.
- **Widths.** Wide screens don't stretch things: forms, fields and search stop at 480 px, notices at 720 px, and the skin details column at 440 px, so Wear fills that column rather than the page.
- **Any screen size.** Layouts work from a 280 px folded phone to a 3,440 px ultrawide, including landscape phones and 200% zoom. The phone menu scrolls inside the header on short screens. The search button and theme picker are full 44 px targets.
- **Checks.** `scripts/contrast.mjs` covers 109 color pairs across the three themes, all passing WCAG AA. `scripts/check-version.mjs` checks that every file names the same version. `scripts/responsive.mjs` checks 21 screen sizes in CI.
