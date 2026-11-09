# Changelog

Sites pin a tag (`v0.1.0`). Each entry says what changed and what a site has to do when it upgrades.

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
