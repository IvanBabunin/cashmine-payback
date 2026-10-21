# Project rules

@AGENTS.md

`AGENTS.md` above is Expo's general guidance. Where the two disagree, **this file wins**.

**This is a web-only app.** It is built with Expo (React Native + TypeScript), exported as a static SPA (`npx expo export -p web`) and deployed to Vercel. It is opened on a phone browser. iOS/Android builds, EAS Build/Update and native-only modules are out of scope.

Use the `expo` plugin skills (enabled in `.claude/settings.json`) for Expo and Expo Router work before writing code from memory.

**Navigation: A — tabs: кожен таб — папка з _layout (Stack) + index; група `(tabs)`**

## Stack

Expo SDK 57 · Expo Router · react-native-web · TypeScript strict · TanStack Query (server state) · Zustand (client state, persisted to `localStorage`) · react-hook-form + zod · i18next (`en`) · Reanimated · `@react-native-vector-icons/*` · Vercel.

Install packages with `npx expo install <pkg>`, never plain `npm i`. **Before adding any package, check that it supports web.** No `expo-secure-store`, MMKV, `@expo/ui`, `expo-glass-effect`, `NativeTabs` or other native-only APIs.

## Structure

One rule everywhere: **folder by type first, then by domain/section inside it.**

```
app/                 routes only (Expo Router)
components/
  shared/ui/         base building blocks, props only, no business logic
  shared/layout/     AppFrame, Screen, EmptyState, ErrorState, TabBarIcon
  shared/forms/      inputs wired to react-hook-form
  screens/<section>/ components used by ONE section, mirrors app/
hooks/
  api/<domain>/      TanStack Query hooks (useX, useCreateX)
  ui/                UI behaviour hooks
  utils/             generic hooks (useDebounce)
api/<domain>.ts      request functions only, one file per domain
store/<domain>.ts    Zustand, one file per domain
types/models/        API response types
types/forms/         zod schemas for forms + z.infer types
providers/           AppProviders, ThemeProvider
theme/               tokens, makeStyles, useTheme
i18n/locales/en/<section>.json
helpers/api/         client, errors, endpoints, query-keys, schema.d.ts (generated)
helpers/format/      pure formatters
helpers/             routes, logger, query-client
config/env.ts        EXPO_PUBLIC_* validated with zod
ai-logs/             exported AI conversations (required by the submission)
```

**Sections vs domains.** Sections are the first-level folders of the navigation group in `app/` (a tab, or a first stack level). They name `components/screens/<section>` and `i18n/locales/en/<section>.json`. Domains are backend entities, plural (`orders`, `users`). They name `api/`, `hooks/api/`, `store/`, `types/`, and query keys.

A component in `screens/<section>` is used by that section only. The moment a second section needs it, move it to `shared/`.

## Layers (enforced by ESLint — do not disable the rule)

| Folder               | May import from                                                                         |
| -------------------- | --------------------------------------------------------------------------------------- |
| `app`                | everything                                                                              |
| `providers`          | everything except `app`                                                                 |
| `components/screens` | `components/shared`, `hooks`, `store`, `theme`, `i18n`, `helpers`, `types`              |
| `components/shared`  | `components/shared`, `theme`, `i18n`, `helpers`, `types` (no data fetching, props only) |
| `hooks`              | `api`, `store`, `helpers`, `types`, `config`, `theme`, `i18n`                           |
| `api`                | `helpers`, `types`, `config`                                                            |
| `store`              | `helpers`, `types`                                                                      |
| `theme`, `i18n`      | own files only                                                                          |
| `helpers`            | `helpers`, `config`, `types`                                                            |
| `types`              | `helpers/api/schema`                                                                    |

- Cross-folder imports use the `@/` alias. `../` is forbidden.
- Nothing imports from `app/`.

## Routes (`app/`)

- `app/` contains routes only. Every file there becomes a screen, so never put components or utils in it.
- A route file IS the screen: data from `hooks/api`, markup from `components/`. Keep it under ~150 lines.
- Every route is a URL. Refreshing the page or opening a deep link must work, so screens read everything they need from route params, not from state passed by the previous screen.
- Navigate with `ROUTES` (`helpers/routes.ts`): `router.push(ROUTES.SETTINGS)`, `router.push(ROUTES.DETAILS(id))`. Never inline paths.
- `_layout.tsx` only where navigation behaviour changes (navigator type, header). Not one per folder.
- Screens that open over the current one and close with ✕ go to `app/(modals)/` with `presentation: 'modal'`.
- Nesting depth ≤ 2 by ownership. An entity with a unique id gets a short route (`orders/[orderId]`), not a chain of parent params.
- In-screen tabs: a `_layout.tsx` at that level using `expo-router/js-top-tabs`.
- Never import `@react-navigation/*` directly (SDK 56+). Use `expo-router` entry points (`expo-router/react-navigation`, `expo-router/js-top-tabs`, …).
- Navigation patterns: **A tabs** — `(tabs)/<tab>/_layout.tsx + index.tsx`, first tab as a group `(home)` so it lives at `/`. **B stack** — `(main)/` with one Stack for all levels. **C mixed** — tabs whose tab Stacks contain levels.

## Data

- Server data lives in TanStack Query only. Never copy it into Zustand.
- Zustand holds client state only: settings, filters, drafts.
- Chain is always `api/<domain>.ts` → `hooks/api/<domain>/useX.ts` → component. Components never call `http` or `fetch`.
- Query keys come from `helpers/api/query-keys.ts`, never inline arrays.
- Endpoint paths come from `ENDPOINTS` (`helpers/api/endpoints.ts`), never inline strings.
- Response types: if the API has an OpenAPI/Swagger spec, generate `helpers/api/schema.d.ts` (`npm run api:types`) and alias in `types/models/*` (`export type Order = components['schemas']['OrderDto']`). If it has only written docs, define the types in `types/models/*` from the docs.
- Errors are `ApiError` (`helpers/api/errors.ts`). Adjust `fromResponse` to the API's real error shape.

## API access

- Base URL comes from `config/env.ts` (`EXPO_PUBLIC_API_URL`, defaults to `https://task-api.cashmine.io`). The token is NOT an env var: the user enters it in the app, it is persisted in `store/auth.ts` and pushed to `helpers/api/client.ts` (`setAuthToken`) by `AppProviders`. Never put a token in code, `.env`, Vercel or CI.
- `EXPO_PUBLIC_*` values are inlined into the JS bundle at build time and are readable by anyone who opens the site. Never commit `.env`. Mention this trade-off in the README.
- Requests go straight from the browser, so the API must allow our origin (CORS). Check with `curl -i -H "Origin: https://example.vercel.app" …` before building screens.

## UI

- Mobile-first. Design for ~390px wide; `AppFrame` caps the app at `layout.maxWidth` and centres it on desktop.
- Colors, spacing, radius, typography, layout come from `theme` tokens only. No hex values or magic numbers in components.
- Styles: `const useStyles = makeStyles((t) => ({ … }))` at the bottom of the file. Inline styles only for dynamic values.
- Every screen is wrapped in `<Screen>`.
- Every loading, empty and error state is handled (`EmptyState`, `ErrorState`, `loading` on `Button`).
- Every user-facing string goes through `t()`. Namespaces are sections: `useTranslation('orders')`, shared strings in `common`. Need keys from several namespaces → `useTranslation(['orders', 'common'])` and prefix the non-first ones: `t('common:actions.save')`. Register new namespaces in `i18n/resources.ts`.
- zod error messages are translation keys (`'orders:errors.nameRequired'`); `FormInput` translates them.
- Icons: `@react-native-vector-icons/material-design-icons`.
- Tabs: `Tabs` from `expo-router` (JS tab bar). Animation: `react-native-reanimated`.

## Naming

- Components and screens components: `PascalCase.tsx`, one component per file, `type XProps` in the same file.
- Hooks: `useSomething.ts`. Everything else: `kebab-case.ts`. Route files follow Expo Router.
- Named exports everywhere; `export default` only in route files.
- Barrel `index.ts` only in `components/shared/*` and `theme/`.
- Tests sit next to the file: `format-price.test.ts`.

## Adding a feature (e.g. `orders`)

1. Types: `npm run api:types` + alias, or write them from the docs in `types/models/order.ts`.
2. Paths in `helpers/api/endpoints.ts` → `api/orders.ts` → keys in `helpers/api/query-keys.ts` → `hooks/api/orders/useOrders.ts`.
3. Route files in `app/` + paths in `helpers/routes.ts` → components in `components/screens/orders/`.
4. `i18n/locales/en/orders.json` → register in `i18n/resources.ts`.
5. Form? zod schema in `types/forms/`.

## Git

- Small commits after each working step, imperative subject (`Add orders list`). Reviewers read the history.

## Deploy

- `.github/workflows/ci.yml`: `check` (lint, typecheck, test, build) on every PR and push; `deploy` to Vercel production on push to `main`, only after `check` passes.
- `deploy` needs the GitHub secret `VERCEL_TOKEN` and the variables `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`; it is skipped while `VERCEL_PROJECT_ID` is unset. Setup steps are in the README (Deploy). If the user asks to set up deploy, walk them through them; run `vercel login`, `gh secret set` and anything that needs a token only with their confirmation, and never print or commit the token.
- App env vars (`EXPO_PUBLIC_*`) live in Vercel's Production environment; `vercel pull` fetches them at build time. A new `EXPO_PUBLIC_*` var goes into `config/env.ts`, `.env.example` and Vercel.
- Vercel Git deployments are off in `vercel.json` (`git.deploymentEnabled: false`) so production only ships through CI. Don't turn them back on, and don't deploy by pushing straight to Vercel unless asked.

## Done means

`npm run lint`, `npm run typecheck`, `npm test` and `npm run build` all pass. No new warnings. The change is checked in a browser at phone width.

## Never

- Components, hooks or utils inside `app/`.
- `fetch`/`http` in components, or server data in Zustand.
- Native-only packages or APIs.
- Hardcoded colors, spacing or UI strings.
- `@react-navigation/*` or `@expo/vector-icons` imports.
- `../` imports across folders, or disabling the layer lint rule.
- Editing `helpers/api/schema.d.ts` by hand.
- Committing `.env`.
