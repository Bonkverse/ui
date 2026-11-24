# Changelog

Sites pin a tag (`v0.1.0`). Each entry says what changed and what a site has to do when it upgrades.

## 0.1.9 (2026-11-24)

The account switcher (RFC-0003 phase 5): people with several bonk.io accounts switch between them from the header's account menu, on every Bonkverse site.

- **`account.mjs` (new), with types in `account.d.ts`:** for the replay site and the docs, whose headers are built in the browser. `getMe()` reads bonkverse.io's `/api/me/` (now with `accounts`); `switchAccount(id)` switches through `/api/me/switch/` without leaving the page; `addAccountHref(next)` and `signInHref(username, next)` link to bonkverse.io's login. Only accounts signed in on this browser can be switched to.
- **Menus:** `.bv-menu__label` (a small heading over a group of items), `.bv-menu__text` (an item's text when a badge follows; it wraps) and `.bv-menu__badge` ("Sign in", "Not connected").
- **`nav.json`:** the account menu gains "Add bonk.io account" (`/login/?add=1`, `id: "add-account"`). Sites on other domains add `&next=` with the page they're on (`addAccountHref`).
- **Gallery:** the sample account menu shows the switcher.

Upgrading:

- bonkverse.io: `python scripts/sync_ui.py v0.1.9`. Its header already renders the switcher on the server; drop the site's own `.bv-account-row` / `.bv-account-menu__label` styles for the package's menu classes, and render "Add bonk.io account" from `nav.json` instead of by hand.
- Replay site and docs: bump the dependency to `v0.1.9` and render the switcher with `account.mjs` in the account menu.

## 0.1.8 (2026-11-23)

Gallery only. No CSS or script changes; sites that don't serve the gallery have nothing to do.

- **Gallery:** the sample account in the header ("nova_rider" and its menu) no longer links to bonkverse.io. "nova_rider", My profile, Settings and API keys opened the viewer's own pages, and Log out was a real form. They're now sample links that go nowhere.

Upgrading:

- bonkverse.io: `python scripts/sync_ui.py v0.1.8`, which updates the gallery at bonkverse.io/ui.
- Replay site and docs: optional. They don't ship the gallery.

## 0.1.7 (2026-11-23)

Seasonal themes: Halloween, Christmas and New Year, across every site, with a switch to turn them off. And one **Appearance** button in the header for the theme and the season switch.

- **`.bv-appearance` (new):** a palette button in the header. Its menu holds the theme choice and, in season, the seasonal switch, replacing the separate theme picker and switch in the bar. On phones the button reads "Appearance". `.bv-theme-picker` still works where a site wants it elsewhere.
- **`bv-appearance-at`:** `theme.js` stamps this cookie, the time in milliseconds, whenever someone picks a theme or flips the season switch. A site that saves the choice to an account can then tell a newer choice from an old one left on another device.

- **`seasons.css` (new):** each season on top of each of the three themes (nine palettes). It changes the page, card and inset surfaces, the header, the accent (links, focus, selection, highlight, first chart color) and the main action. Favorites stay gold and errors stay red. `scripts/contrast.mjs` checks every season in every theme: 592 pairs, 0 failing.
  - **Halloween** (October): dusk purple, pumpkin orange.
  - **Christmas** (December 1–30): pine green, berry-red header, frost-green accent.
  - **New Year** (December 31 – January 7): midnight navy, champagne and violet.
- **Small touches:**
  - A badge on the logo: a pumpkin, an ornament or a star.
  - One light animation in the header: a bat crosses once, snow drifts slowly, or confetti falls once. There's no animation with reduce motion.
  - `data-bv-season-text="<season>"` shows an element only in that season, for greetings.
- **theme.js** works out the season from the visitor's own date.
  - It sets `data-bv-season-now` (the calendar season) and `data-bv-season` (the season showing) on `<html>`.
  - Switching seasons off is saved as `bv-season=off` on `.bonkverse.io`, like the theme, so it applies on every site.
  - `<input type="checkbox" data-bv-season-toggle>` inside `.bv-season-toggle` is the switch. It only shows while a season is on the calendar.
  - `?bv-season=halloween|christmas|newyear|none` previews a season on one page without saving.
  - New API: `BonkverseTheme.season()`, `seasonNow()`, `setSeasonal(on)`, and the `bv:seasonchange` event.
- **Gallery:** a Seasons section with all nine palettes, preview links and the switch in the header.

Upgrading:

- Load `seasons.css` after `components.css`.
- Replace the header's theme picker with the Appearance menu (markup in `components.css` and in the gallery header). Its menu includes the season switch: `<label class="bv-season-toggle"><input type="checkbox" data-bv-season-toggle> <span>Seasonal theme</span></label>`.
- Drop any seasonal stylesheet of your own.

## 0.1.6 (2026-11-22)

Borderless surfaces, and a highlight used only where it matters. The Bonkverse Discord found the teal outlines on everything "shiny" and "AI slop". The site owner picked the borderless option from a mockup.

- **Surfaces, not borders:**
  - `.bv-card` and `.bv-skin-card` have no visible border. The step from page to card and a soft shadow (`--bv-card-shadow`) are the edge. The border stays as `transparent`, so forced-colors mode still draws it.
  - The Bonkverse theme's page and card are darker: page `#141e27`, card `#1f2e3a`, thumb and input `#17232d`.
- **`--bv-inset` (new):** the fill for things inside a card. `.bv-notice` uses it, with no border and no 3px left stripe. Danger notices keep a red border.
- **Quieter lines:**
  - `--bv-outline` and `--bv-divider` are softer, for table rows and separators only.
  - `.bv-tabs`, the header, `.bv-table-wrap`, `.bv-code`, `.bv-pill`, toasts and inline `code` drop their borders. The selected tab keeps its teal underline.
- **Selected** (`aria-pressed`, a current chip) is the teal fill with a 1px teal border. The extra inset ring is gone. Hovering it turns the border to the text color. The thin border stays so selection isn't shown by fill alone. `.bv-pill--accent` is the fill only.
- **Ghost buttons** hover with `--bv-hover` instead of a teal border.
- **`.bv-highlight` / `--bv-highlight` (new):** a teal ring plus soft glow. Use it for **at most one thing per view** that's worth the user's attention: the week's most active player, your own row, something new, something to do. Never for selection, hover or labels.
- **`--bv-series-1..4` (new):** chart colors for each theme.
- **`scripts/contrast.mjs`:** adds pairs for the inset fill and the highlight ring. 148 pairs, 0 failing.

Upgrading:

- Sync the release.
- Drop site CSS that draws borders on cards or nested items, and use `--bv-inset` for things inside a card.
- Replace teal outlines that aren't focus, selection or a highlight.
- Switch chart colors to `--bv-series-N`.

## 0.1.5 (2026-11-22)

Jost's Futura-style lowercase "a", asked for in the Bonkverse Discord.

- **Fonts:** the Jost files are rebuilt from Google Fonts' Jost 3.710 (the same version as before) and now keep the `ss01` feature, which the old files had dropped. They're about the same size. `scripts/build_fonts.py` rebuilds them.
- **base.css:** `body` turns on `font-feature-settings: "ss01" 1`, so text uses the single-story "a". `code`, `kbd` and `pre` reset it to `normal`, so monospace fonts keep their usual letters.

Upgrading: sync the release (the font files change too). If a site sets `font-feature-settings` on an element, include `"ss01" 1` there, or that element goes back to the two-story "a". `font-variant-numeric: tabular-nums` is a separate property and keeps working alongside it.

## 0.1.4 (2026-11-19)

Menu labels for pages bonkverse.io renamed.

- **Skin tabs:** "Leaderboards" is now **Top skins** (bonkverse.io merged its three leaderboards into one Top skins page). The id stays `leaderboards` and the link is the same, so active-tab highlighting keeps working.
- **Footer:** "Social stats" is now **Community stats**, the page's new name.

Upgrading: nothing to change beyond syncing the release.

## 0.1.3 (2026-11-09)

Contrast and states: in every theme you can tell a button, chip or tag apart from what's behind it, and see when it's hovered, pressed, selected or unavailable.

- **Hover** has its own fill (`--bv-hover`), and bordered controls (buttons, chips) darken their border to the text color. Before, hover used the selected fill, which in Light was barely different from the card.
- **Selected** (`aria-pressed`, a current chip) is a stronger teal fill with a 2 px teal border, so it doesn't look like hover; hovering it thickens the border. Chips with `aria-current` get it too.
- **Unavailable** buttons and chips fade and get a dashed border.
- **Danger.** `.bv-btn--danger` is now solid red with white text, for the step you can't undo (Delete, Revoke, a delete dialog's confirm). The old red-outline look is `.bv-btn--danger-outline`, now on a red tint: use it for Report and for buttons that open a confirm. New tokens: `--bv-danger-solid`, `-hover`, `-pressed`, `--bv-danger-ink`, `--bv-danger-border`.
- **Menus.** Danger items hover red-tinted.
- **Tabs.** The selected code tab (`.bv-tabs [role=tab]`) lost its teal underline to the reset rule; it has it again, and hovering a tab shows a grey one.
- **Header.** Hovering the brand underlines it, and hovering the current page's link deepens its fill.
- **Pills** use the text color on a light fill instead of grey on nothing; the accent pill is filled.
- **Fix:** `<body class="bv-app">` stretched everything placed directly in `<body>` to full width, including fixed toasts and panels, which pushed a site's corner toast off the left edge. The rule now has zero specificity and leaves dialogs and toasts alone.
- `scripts/contrast.mjs` checks the new pairs (130 in all).

Upgrading:
- Buttons with `bv-btn--danger` that only open a confirm (or report something) become `bv-btn--danger-outline`.
- Anything that used `--bv-selected` for hover should use `--bv-hover`.

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
