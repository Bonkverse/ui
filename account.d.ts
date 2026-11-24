// Types for account.mjs (Bonkverse UI v0.1.9).

export const SITE: string;

/** One of the person's bonk.io accounts, from bonkverse.io's /api/me/. */
export interface BonkverseAccount {
  id: number;
  username: string;
  /** The account in use. */
  active: boolean;
  /** The group's main account. */
  main: boolean;
  /** Signed in on this browser: can be switched to without a password. */
  signed_in: boolean;
  /** Wear can act as it without asking for its bonk.io password. */
  connected: boolean;
}

export interface BonkverseMe {
  authenticated: true;
  user: {
    id: number;
    username: string;
    avatar: string | null;
    appearance?: unknown;
  };
  accounts: BonkverseAccount[];
  permissions?: Record<string, boolean>;
}

export function getMe(site?: string): Promise<BonkverseMe | null>;
export function otherAccounts(me: BonkverseMe | null): BonkverseAccount[];
export function switchAccount(
  id: number,
  site?: string,
): Promise<{ok: true; me: BonkverseMe} | {ok: false; message: string}>;
export function addAccountHref(next: string, site?: string): string;
export function signInHref(username: string, next: string, site?: string): string;
