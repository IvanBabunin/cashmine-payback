# CashMine Payback

See payback balances and claim them. Web build of an Expo (React Native) app, made for a phone screen.

**Live:** https://cashmine-payback-omega.vercel.app

On first open the app asks for an API token. It is kept only in your browser; change it in Settings.

## Run locally

Requires Node 22.

```
npm install
npm start          # opens the app in the browser
```

Optional: copy `.env.example` to `.env` to point `EXPO_PUBLIC_API_URL` at another API. The default is in `config/env.ts`. No token goes in env files.

| Command             | What it does                   |
| ------------------- | ------------------------------ |
| `npm start`         | dev server in the browser      |
| `npm test`          | unit tests (amounts, balances) |
| `npm run lint`      | ESLint, including layer rules  |
| `npm run typecheck` | TypeScript                     |
| `npm run build`     | static web build into `dist/`  |

## What works

- **Balances:** available, pending and claiming per asset, USD value, total in USD, "Updated Xs ago". Loading, error with retry, refresh button; refetches every 15 s.
- **Claim:** pick an asset, enter an amount or tap Max, choose a destination, see fee and amount received, review, confirm.
  - Input is validated against the API rules: format, decimals, minimum, available, more than the fee.
  - The status screen follows the claim until it completes or fails, with the reason.
- **Balance right after a claim:** reconciled against the snapshot time, so it drops once and does not jump back.
- **Unknown claim results:** safe retry with the same idempotency key, surviving a reload.
- **Activity:** paginated history of accruals, reversals and claims.
- **Tests:** unit tests for parsing, validation, fee, USD totals and balance reconciliation.
- **Deploy:** GitHub Actions runs lint, typecheck, tests and build, then deploys to Vercel on push to `main`.

Decisions, AI notes and known issues: [NOTES.md](NOTES.md). AI conversations: [ai-logs/](ai-logs/).
