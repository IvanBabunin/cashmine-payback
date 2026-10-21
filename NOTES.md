# Notes

## Decisions

**How amounts are represented and calculated.** Every amount is a `bigint` in the asset's smallest unit (`10^-decimals`), parsed from and formatted back to the API's decimal strings (`helpers/format/amount.ts`). Input is checked against the API's exact format (`0.5` and `12` pass; `.5`, `1.`, `05`, `1e-3` fail) and the asset's `decimals`. USD values use the price's own scale and are rounded half-up to cents once, at the end. _Alternatives:_ JS numbers (wrong: `0.1 + 0.2`, and 18-decimal ETH does not fit in a double) or a decimal library such as big.js (works, but we only need add, subtract, multiply and compare, which native `bigint` does with no dependency). The total in USD counts available + pending + claiming, so moving money into a claim does not change the total.

**What the balance shows right after a claim.** I asked the AI for options before choosing (see the plan near the start of `ai-logs/`):

- A. Show only the server snapshot plus a "claim in progress" note. Honest, but for up to 15 s the old `available` is still on screen: the "I claimed again" complaint.
- B. Subtract optimistically. The next snapshot can still predate the claim and undo it: the "dropped, then jumped back" complaint.
- C (chosen). Reconcile against `asOf`. A claim this device made is subtracted from `available` (and added to `claiming`) only while the snapshot is older than the claim's `createdAt`. Both times come from the server, so the phone's clock does not matter. Once a newer snapshot arrives it already includes the claim, so the app stops adjusting and the number does not move. The balance drops once and only rises again if the claim really fails, which the claim screen explains. Adjusted cards say "Includes your recent claim". Max and validation use the adjusted `available`, so the same money cannot be claimed twice from a stale snapshot. Logic and tests: `helpers/reconcile-balances.ts`.

**When the result of a claim request is unknown** (timeout, 5xx, 504, network error). Before sending, the app saves the `Idempotency-Key` and body to localStorage (`store/claims.ts`). It retries twice with the same key and body (and waits `retryAfterMs` on 429). If it still has no answer, the review screen says "We couldn't confirm your claim… checking again is safe: it never creates a second claim" and replaces Confirm with "Check again". Editing is hidden because a changed body needs a new key. The pending claim survives a reload and shows as a banner on Home until resolved. A 4xx response means nothing was created, so the saved key is dropped and the server's message is shown. _Alternatives:_ treat it as a failure (invites a second, real claim) or search Activity for the claim (there is no list-claims endpoint, and without the response we have no claim id to match). Tested by dropping the response after the server received the request: 3 attempts with one key, then "Check again" got back the original claim, and the server had exactly one claim.

**Other decisions.**

- **Token:** asked for on first open and saved in localStorage (`store/auth.ts`). Settings → Change token clears it, along with cached data and saved claims. A 401 sends the user back to the token screen with a message. It is never in env vars, the repo or the build (checked by searching `dist/` and the git history).
- **Navigation:** tabs (Balances, Activity, Settings), `/claim?asset=…`, and `/claims/[claimId]`. Every screen reads its route params, so refresh and deep links work.
- **Refresh rates:** balances refetch every 15 s (the snapshot interval), and an open claim refetches every 2 s until it settles.
- **Look:** palette, radii and font (Inter) come from the tokens cashmine.io publishes in its stylesheets. No logo is used.
- **Redesign from a mockup:** I took a structure from a mockup I made with another Claude chat (total card, share bar, asset cards with a stat grid, tonal per-asset claim button). I dropped its sparklines and 24h % changes, because the API has no price history and showing them would mean inventing numbers, and "Claim all", because there is no batch claim endpoint. I also dropped its glows, grid backdrop and glass nav, which read as decoration.

## Working with AI

All in `ai-logs/` (one Claude Code session; search for the quoted phrases).

1. **A prompt that did not get me what I wanted.** When I ran `/impeccable init`, the first round of questions came back with only an intro line and no questions, so I typed "retry" and the questions came through (search "retry"). My first prompt was also very broad ("check readme and find the best way to complete this task"). I asked for a plan before any code, which made the AI lay out the decisions (balance option A/B/C, navigation, deploy) for me to choose.
2. **AI output that was wrong or risky.** The first claim flow showed the "We couldn't confirm your claim" warning while the request was still running, which would tell a user their claim might be lost and push them to act. We found it in the browser at phone width, not in tests. The fix hides the warning while a request for that key is running (`useMutationState`). Also wrong: the AI wrote a USD test expecting `82057` cents when the right value is `82058`. The failing test caught it. And `vercel link` added `.env*` to `.gitignore`, which also hid `.env.example`. I caught that in the diff.
3. **Where I rejected a suggestion.** For brand, the AI recommended keeping the template's neutral colours; I chose to match cashmine.io instead, because this is a slice of the CashMine app and should look like it. The AI also recommended writing NOTES/README before any restyle; I did the restyle first while there was still time to check it in the browser. In the other direction, I asked to remove the API URL from git history; the AI pushed back (the URL is public and a force-push would rewrite the history reviewers read), and I kept the history.

## Not done / known issues

- **Token wiped once:** in a local build, the saved token was gone once and I couldn't reproduce it. Storage loads synchronously and the API returned no 401 in testing. Next: log why the token gets cleared.
- **Any 401 logs out:** a single 401 clears the token. That is right for an expired token but harsh for a stray one. Next: confirm with a second request before logging out.
- **Changing the token drops unconfirmed claims:** saved claims whose result is unknown are cleared too.
- **Clock skew:** "Updated Xs ago" compares the server's `asOf` with the phone's clock, clamped at 0.
- **Not a real modal on web:** the claim screen opens full-screen rather than as a sheet.
- **Test gaps:** unit tests cover amount logic and reconciliation only. No component or end-to-end tests.
- **Other gaps:** no `DESIGN.md`, English only, and Activity does not link a reversal to its accrual.
