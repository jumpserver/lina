# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

i18n tooling (translations live in `src/i18n/langs/*.json`):

```bash
yarn vue-i18n-report      # list missing/unused keys
yarn diff-i18n            # python diff en vs ja/zh_Hant
yarn apply-i18n           # python apply across locales
```

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

## Conventions

- Reply and write UI text in the user's language; user-facing strings go through i18n (`$t`/`$tc`), with keys in `src/i18n/langs`.
- This is a Vue 3 migration branch (`v5_vue3`) off Element UI → Element Plus. Watch for Vue-3-specific gotchas the codebase has already hit: prop `default()` factories are **not** bound to the instance (`this` is undefined — import singletons like `@/store` directly); `el-link` `underline` takes `'always'|'hover'|'never'`, not boolean.
- Run `yarn fix` (lint:fix + fmt) before committing. Commit messages in this repo use Conventional-Commit prefixes (`fix:`, `feat:`, `perf:`, `style:`).
