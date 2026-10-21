# **APP_NAME**

Expo SDK 57 web app · Expo Router · TypeScript · TanStack Query · Zustand. Built as a static SPA and deployed to Vercel; made to be opened on a phone.

## New project from this template

1. GitHub → **Use this template** → clone.
2. `npm install`
3. `npm run setup` asks for the name and navigation:
   - **tabs**: bottom tab bar; each tab is a folder with `_layout.tsx` and `index.tsx`;
   - **stack**: levels without tabs (list → details → …);
   - **mixed**: tabs with levels inside them.

   Non-interactive: `npm run setup -- --name "My App" --nav stack`

4. `cp .env.example .env` and fill in `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_API_TOKEN`.
5. `npm start` opens the app in the browser.

The setup script deletes itself and the `navigation/` folder when it finishes.

## Commands

| Command             | What it does                                           |
| ------------------- | ------------------------------------------------------ |
| `npm start`         | dev server in the browser                              |
| `npm run build`     | static web build into `dist/`                          |
| `npm run lint`      | ESLint, including the layer rules                      |
| `npm run typecheck` | TypeScript                                             |
| `npm test`          | Jest                                                   |
| `npm run api:types` | types from an OpenAPI spec → `helpers/api/schema.d.ts` |
| `npm run doctor`    | Expo dependency check                                  |

## Deploy (Vercel)

`vercel.json` sets the build command, the `dist` output and a rewrite so every path serves `index.html` (deep links and refresh work). It also turns off Vercel's own Git deployments: GitHub Actions deploys instead, so nothing reaches production unless lint, typecheck, tests and build pass.

Every push to `main` runs `.github/workflows/ci.yml`: the `check` job, then the `deploy` job (`vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod`). Pull requests run `check` only. Until the repository has the variables below, `deploy` is skipped and CI stays green.

### One-time setup

1. Create and link the Vercel project from the repo root:
   ```
   npx vercel login
   npx vercel link
   ```
   This writes `.vercel/project.json` (git-ignored) with `orgId` and `projectId`.
2. Add the app's variables to Vercel for **Production**. The build reads them from there:
   ```
   npx vercel env add EXPO_PUBLIC_API_URL production
   npx vercel env add EXPO_PUBLIC_API_TOKEN production
   ```
   Or Project → Settings → Environment Variables.
3. Create a token at https://vercel.com/account/tokens.
4. In GitHub → repo → Settings → Secrets and variables → Actions add:

   | Kind     | Name                | Value                                   |
   | -------- | ------------------- | --------------------------------------- |
   | Secret   | `VERCEL_TOKEN`      | token from step 3                       |
   | Variable | `VERCEL_ORG_ID`     | `orgId` from `.vercel/project.json`     |
   | Variable | `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |

   With the GitHub CLI:

   ```
   gh secret set VERCEL_TOKEN
   gh variable set VERCEL_ORG_ID --body "$(node -p "require('./.vercel/project.json').orgId")"
   gh variable set VERCEL_PROJECT_ID --body "$(node -p "require('./.vercel/project.json').projectId")"
   ```

5. Push to `main`. The deploy URL shows on the run summary and under the repo's **Environments → production**.

Changing a variable in Vercel takes effect on the next deploy (re-run the last workflow or push again). Manual deploy from your machine: `npx vercel deploy --prod`.

`EXPO_PUBLIC_*` values are inlined into the JS bundle, so the API token is visible to anyone who opens the site. A production app would keep it on a server (for example a Vercel function that proxies the API).

## AI logs

Exported AI conversations go in `ai-logs/`.
