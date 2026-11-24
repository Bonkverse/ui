/*
 * Bonkverse UI account helpers (v0.1.9)
 *
 * For the shared header on Bonkverse's other sites (replays, docs): who is
 * signed in on bonkverse.io and their other bonk.io accounts, and switching
 * between those accounts without leaving the page. bonkverse.io renders its
 * own header on the server and doesn't need this.
 *
 * bonkverse.io's session cookie covers .bonkverse.io, so a switch here
 * changes the account everywhere. Only accounts signed in on this browser
 * (`signed_in`) can be switched to; the others link to bonkverse.io's login
 * with their name filled in (signInHref).
 *
 *   import { getMe, switchAccount, addAccountHref, signInHref } from "@bonkverse/ui/account.mjs";
 *
 *   const me = await getMe();          // null when signed out or unreachable
 *   me.user.username, me.user.avatar   // the account in use
 *   me.accounts                        // [{ id, username, active, main, signed_in, connected }]
 *   const result = await switchAccount(id);  // { ok: true, me } or { ok: false, message }
 *
 * No dependencies; works in any browser with fetch.
 */

export const SITE = "https://bonkverse.io";

/**
 * Who is signed in on bonkverse.io, as /api/me/ answers it, or null when
 * nobody is (or bonkverse.io can't be reached). `accounts` is [] on
 * bonkverse.io releases from before account groups.
 */
export async function getMe(site = SITE) {
  try {
    const response = await fetch(`${site}/api/me/`, { credentials: "include" });
    if (!response.ok) return null;
    const me = await response.json();
    if (!me || !me.authenticated) return null;
    return { ...me, accounts: Array.isArray(me.accounts) ? me.accounts : [] };
  } catch {
    return null;
  }
}

/**
 * The person's other bonk.io accounts, for the switcher: everything in
 * `me.accounts` but the one in use.
 */
export function otherAccounts(me) {
  return me ? me.accounts.filter((account) => !account.active) : [];
}

/**
 * Use another bonk.io account signed in on this browser.
 *
 * bonkverse.io's CSRF token is only readable on bonkverse.io, so this sends
 * a JSON body and the X-Bonkverse-Switch header instead; bonkverse.io only
 * lets its own sites send that header.
 *
 * Returns { ok: true, me } with /api/me/'s new answer, or { ok: false,
 * message } to show the person.
 */
export async function switchAccount(id, site = SITE) {
  try {
    const response = await fetch(`${site}/api/me/switch/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", "X-Bonkverse-Switch": "1" },
      body: JSON.stringify({ account: id }),
    });
    const body = await response.json().catch(() => ({}));
    if (response.ok && body.ok) {
      const { ok, ...me } = body;
      return { ok: true, me: { ...me, accounts: me.accounts || [] } };
    }
    return { ok: false, message: body.message || "Couldn't switch accounts. Try again." };
  } catch {
    return { ok: false, message: "Couldn't reach bonkverse.io. Try again." };
  }
}

/** bonkverse.io's "Add account" page, coming back to `next` afterwards. */
export function addAccountHref(next, site = SITE) {
  return `${site}/login/?add=1&next=${encodeURIComponent(next)}`;
}

/** Sign in to a group account that isn't signed in on this browser. */
export function signInHref(username, next, site = SITE) {
  return `${site}/login/?add=1&username=${encodeURIComponent(username)}&next=${encodeURIComponent(next)}`;
}
