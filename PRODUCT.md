# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Active crypto traders who trade on exchanges such as Binance and OKX and earn payback (part of their trading fees returned) through CashMine. They open the app on a phone browser to check how much payback they have and to claim it when it is worth it. They care about exact amounts and about trusting what the app shows.

Secondary audience: CashMine reviewers opening the deployed link on a phone with their own API tokens.

## Product Purpose

A slice of the upcoming CashMine mobile app: see payback balances per asset and claim them. The money is real for CashMine users, so correctness of amounts and of the claim flow matters more than polish. Success means a user always knows what they have, what a claim will cost and receive, and what happened to a claim they submitted.

## Positioning

CashMine pays users back part of the trading fees they pay on crypto exchanges. This app is the place where that payback becomes money the user can take out.

## Operating Context

- Opened from a link in a phone browser (~390 px wide); not a native install.
- The user pastes an API token on first open; it is kept in the browser and can be changed.
- Data comes from a remote API that can be slow or fail on any request: balances are 15 s snapshots, claims settle in about 20 s, rate limits apply.
- Typical session: glance at total and per-asset balances, pick an asset, enter an amount or Max, review fee and receive amount, confirm, watch the claim complete or fail.

## Capabilities and Constraints

- Balances per asset: available, pending (accrued, not yet confirmed), claiming (in claims not yet settled), USD value, total in USD, freshness (`asOf`).
- Claim: asset, amount or Max, destination, fee taken from the amount, receive amount, confirm, follow status until completed or failed.
- Activity: paginated history of accruals, reversals and claims.
- Amounts are decimal strings with per-asset decimals (up to 18); never floats.
- A claim whose outcome is unknown (timeout, 5xx, network) is retried with the same idempotency key; the UI must say plainly that the outcome is unknown and that checking again is safe.
- Web only (Expo + react-native-web, static SPA on Vercel). English only for now.

## Brand Commitments

- Name: CashMine. The product term is "payback".
- Visual reference: match the live CashMine web product at cashmine.io where it is visible. No brand assets (logo files, palette) have been provided in the repo yet; do not invent a logo.
- Voice: plain, calm, precise. Short sentences, exact numbers, honest about uncertainty, no hype.

## Evidence on Hand

- No testimonials, customer data, metrics or press. All API data is fake test data; never present it as real.
- No logo or brand asset files in the repository.

## Product Principles

1. Correct money first: every amount shown is exact and traceable to the server or to a stated local adjustment.
2. Never let the user act twice by accident: after a claim, the balance reflects it once and does not bounce back on stale data.
3. Say what we know and what we don't: freshness, pending states and unknown outcomes are visible, not hidden.
4. One glance on a phone: the total, what is claimable, and the next action are readable without scrolling through noise.

## Accessibility & Inclusion

No product-specific standard established. Baseline: readable at phone width, touch targets sized for thumbs, states not conveyed by color alone.
