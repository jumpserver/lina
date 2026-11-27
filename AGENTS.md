# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## What this is

Lina is the web frontend for **JumpServer** (a bastion/PAM platform). It is a Vue 3 + Element Plus SPA that talks to the JumpServer API server. It cannot run standalone — a JumpServer API backend must be reachable (set `VITE_CORE_HOST` in `.env.development`).

- Node `>=24 <25`, yarn `>=4` (`packageManager: yarn@4.13.0`, Berry with `nodeLinker: node-modules`). Enable via `corepack enable`.
- Build tool is **Vite (rolldown-based)**; lin/format use **oxlint / oxfmt** (not eslint/prettier).

## Commands

```bash
yarn serve            # dev server on :9528 (alias of `yarn dev`)
yarn build:prod       # production build (use this, not bare `yarn build`)
yarn preview          # preview built output on :9526
yarn lint             # oxlint over src + vite.config.js
yarn fix              # lint:fix + oxfmt --write (run before committing)
yarn fmt:check        # formatting check only
```

There is **no unit-test framework** in this repo — do not assume `yarn test`. Verify changes with `yarn lint` and `yarn build:prod`.

i18n is managed by **x18n** (`x18n.config.ts`; translations in `src/i18n/langs/{locale}.json`):

```bash
yarn i18n:check           # x18n check: missing keys, missing/stale translations, placeholder/param mismatch, unused keys
yarn exec x18n status     # per-locale coverage
yarn exec x18n <command>  # keys | get | usages | search | set | rename | delete | format | review | ui
```

Adding or changing user-facing text? Author the key in the same commit — see **i18n** under Architecture.

## Dev environment / proxying

`vite.config.js` proxies API/WS traffic to the backend during dev. `base` is `VITE_PUBLIC_PATH` (default `/ui/`). Key proxy prefixes → targets:

- `/api/`, `/core/`, `/static/`, `/media/` → `VITE_CORE_HOST` (the JumpServer API)
- `/ws/` → `VITE_CORE_HOST` (websockets)
- `/koko/` → `VITE_KOKO_HOST` (terminal service), `/luna/`, `/guacamole/`, `/facelive/`, `/chen/` → other JumpServer services

`@` is aliased to `src/`. Env vars must be prefixed `VITE_`.

## Architecture (the parts that span files)

**Bootstrap** (`src/main.js`): registers Vuex `store`, `router`, `vue-i18n`, Element Plus (default `size: 'small'`), global directives, SVG + Element-Plus icons, and exposes `this.$axios` (the configured `src/utils/request.js` client). `$t`/`$tc` are wired as global properties.

**Request layer** (`src/utils/request.js`): single axios instance with `baseURL = BASE_API`. Request interceptor injects `X-CSRFToken` (from cookie), `X-JMS-ORG` (current org id), and `X-TZ`. JumpServer is **multi-org** — most API calls are scoped to the active organization via that header, managed in `store/modules/users` + `store/modules/app`.

**Permission-driven routing** (`src/router/`, `src/guards.js`, `src/utils/jms/index.js`):

- `constantRoutes` are always present; `viewRoutes` (console / pam / audit / workbench / tickets / settings / profile / reports) are gated by backend permissions.
- `router.beforeEach` in `guards.js` lazily generates the routes/menu for the current "view" via `store.dispatch('permission/generateViewRoutes')` after the user profile loads.
- Use `this.$hasPerm(perm)` (global) or the `v-perm` directive (`src/directive/permission`) — render-time permission checks, **not** DOM-removal directives.

**Layout system** (`src/layout/`): the single top-level `Layout` (`layout/index.vue`) renders the fixed navbar (`NavHeader`), side menu (`NavLeft`), and `AppMain` (the `<router-view>` host). The fixed navbar's space is reserved once via `app-wrapper { padding-top: $headerHeight }` (`$headerHeight` in `styles/variables.scss`) — do **not** re-offset `.main-container` with `margin-top`/`top`, that double-counts and was the source of layout gaps. Note: `settings/index.vue` uses `extends: Layout` (a quirk of the settings route).

**`Generic*` page orchestrators** (`src/layout/components/Generic*`): the building blocks every CRUD view composes. `GenericListPage` = `Page` + `GenericListTable`; plus `GenericCreateUpdateForm`, `GenericDetailPage`, `GenericTreeListPage`, `GenericListDrawerPage`, etc. New resource views are almost always assembled from these rather than hand-built. Inside them, `Page` → `PageContent` (`.wrapper-content`) and `TabPage` (`.tab-page-content`) are the scroll containers.

**Config-driven forms & tables** (the highest-leverage abstraction to understand):

- `src/components/Form/DataForm` + `AutoDataForm` render forms from a JS config (`fields`, `fieldsMeta`, `el` props per field) rather than hand-written templates. `AutoDataForm` can derive fields from the API's OPTIONS metadata; nested objects render via `NestedField`. `DataForm/index.vue` owns the canonical form styling (label widths via CSS vars `--label-width`/`--form-column-gap`, 30px control height, input border resets). Custom field widgets live in `src/components/Form/FormFields`.
- `src/components/Table/ListTable` (+ `AutoDataTable`, `DataTable`) render tables from config; cell renderers are in `Table/TableFormatters`.

**Styling conventions** (enforced inconsistently across the app — match the canonical sources):

- Cards: base component is `IBox` (`components/Common/IBox`, wraps `el-card`). All padding lives in `el-card__body`/`__header` (20px, body is `display:flex; flex-direction:column`); the outer card sets none.
- Scoped styles reach Element Plus internals via `:deep()`. Several Element Plus components (`el-drawer`, dropdowns) **teleport to `<body>`**, so their internals must be styled in a **non-scoped** `<style>` block or via the component's `*-class` props (e.g. drawer `header-class`/`body-class`/`modal-class`), not scoped `:deep()`.
- Element Plus icons are globally registered (`src/icons/element-plus-icons.js`) as PascalCase — use `<el-icon><Close /></el-icon>` directly, no per-file import.

**State** (`src/store/modules`): `users` (profile, current org, perms), `app` (device/sidebar, org switching), `permission` (generated routes/menu), `settings`, `table`, `tagsView`, `common`, `assets`, `chat`.

**i18n** (`src/i18n/`, x18n): `en` is `sourceLocale` (`x18n.config.ts`) and the runtime `fallbackLocale`; `zh, zh_hant, ja, ko, es, fr, pt_br, ru, vi` are translations of it. Every user-visible string is a `$t`/`$tc` key — no literal copy in templates, `message.*`/toast/confirm text, table column labels, form labels/placeholders/help, route titles or empty states. **Translations ship with the change, not after it**:

- Author the key in `en.json` **and** `zh.json` in the same commit (source + the locale kept in lockstep with it). The other locales are partial on purpose — top them up through x18n, never by hand-copying English into nine files.
- New meaning → new key. Don't recycle a key whose text means something else; add with `x18n set`, rename with `x18n rename` (it rewrites every locale file), retire with `x18n delete` — no string-replace surgery on the JSON.
- Keys are PascalCase, namespaced when a screen brings several (`ScreenLock.IdleWarningTitle`, `WebLogin.Title`), and interpolations are named (`{seconds}`, `{total}`) — a placeholder set that differs from the source is a `check` error.
- `$tc` keeps the Vue 2 shape (`src/i18n/i18n.js`): a numeric choice selects the `one | many` pipe form, and `en` appends `s` when there is no pipe form — write both forms explicitly for counts instead of relying on that.
- `yarn i18n:check` already fails on a pre-existing backlog (87 legacy `missing-key` errors from bare keys like `DA`/`DP`/`SA`, ~2.5k unused/identical/missing-translation warnings, no baseline in `.x18n/`). Don't widen scope to fix it — but nothing it reports may point at a key, locale entry or file you touched. `yarn i18n:check --only missing-key,placeholder-mismatch,param-mismatch` cuts the noise to real errors.

## Conventions

- Reply and write UI text in the user's language; user-facing strings go through i18n (`$t`/`$tc`), with keys landing in `en.json` + `zh.json` in the same change (see **i18n** above).
- This is a Vue 3 migration branch (`v5_vue3`) off Element UI → Element Plus. Watch for Vue-3-specific gotchas the codebase has already hit: prop `default()` factories are **not** bound to the instance (`this` is undefined — import singletons like `@/store` directly); `el-link` `underline` takes `'always'|'hover'|'never'`, not boolean.
- Run `yarn fix` (lint:fix + fmt) before committing. Commit messages in this repo use Conventional-Commit prefixes (`fix:`, `feat:`, `perf:`, `style:`).
