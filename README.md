<div align="center">

## JumpServer Web Interface

[English](README.md) · [中文(简体)](readmes/README.zh-hans.md) · [中文(繁體)](readmes/README.zh-hant.md)

</div>

## What is Lina?

Lina is the web management interface for [JumpServer](https://github.com/jumpserver/jumpserver), an open-source Privileged Access Management (PAM) platform. It gives administrators one place to manage assets, accounts, permissions, sessions, audit records, tickets, and system settings, and gives users a workspace for their authorized assets, files, jobs, and personal credentials.

Lina is a Vue 3 single-page application. It renders the management console, calls the JumpServer API server (Core) for data and permission checks, and opens terminal and connection sessions through the other JumpServer services:

- [Luna](https://github.com/jumpserver/luna) — web terminal and asset connection workspace
- [KoKo](https://github.com/jumpserver/koko) — SSH, Telnet, WinRM, Kubernetes, and database connector
- [Chen](https://github.com/jumpserver/chen) — database workspace
- [Kael](https://github.com/jumpserver/kael) — AI capabilities

Lina cannot run standalone. A reachable JumpServer API server is required. Lina is released alongside JumpServer, so use the same version as your JumpServer API server.

## Main views

| View | What it covers |
| --- | --- |
| **Console** | Dashboard; users and user groups; assets, zones, and tags; accounts, virtual accounts, and account templates; asset permissions; ACLs and approval settings |
| **PAM** | PAM dashboard, account list, automation (discover accounts, push accounts, backup accounts, and connection tests), security (secret rotation and risk detection), integrations, and account activities |
| **Workbench** | Overview; my assets, file transfer, personal credentials, and file explorer; job center with quick jobs, job management, templates, and execution history; system tools |
| **Tickets** | My tickets, tickets related to me, the ticket list, and the approval workflow designer |
| **Audit** | Dashboard; session audit and online sessions; command, file-transfer, login, operation, password-change, job, and ticket logs; audit reports for the console, PAM, audit, assets, accounts, and users |
| **Settings** | Basic settings, organizations, roles, platforms, AI copilot, notifications, features, authentication, storage, terminal components, security, interface, license, and applets |
| **Profile** | Profile, password and SSH keys, security, passkeys, access keys, tokens, Agent/MCP, and preferences |

## Highlights

- **Permission-driven navigation** — menus and routes are generated from the permissions returned by the API, so each user sees only the views and actions they can use.
- **Multi-organization** — API requests are scoped to the active organization through the `X-JMS-ORG` header, and users can switch organizations without signing out.
- **AI and MCP** — an AI copilot that can use platform capabilities to complete tasks, plus MCP client authorizations and connection guides, with dedicated audit views.
- **Internationalization** — English, Simplified Chinese, Traditional Chinese, Japanese, Korean, Spanish, French, Portuguese (Brazil), Russian, and Vietnamese.
- **Config-driven UI** — forms and tables are generated from field metadata, and page layouts are composed from shared `Generic*` orchestrators.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Vue 3.5 |
| UI components | Element Plus 2 |
| Build | Vite 8 |
| State | Vuex 4 |
| Routing | Vue Router 5 (hash history, `/ui/`) |
| Internationalization | vue-i18n 11 |
| HTTP | axios |
| Lint and format | oxlint and oxfmt |
| Toolchain | Node.js 24 and Yarn 4 |

## Getting started

### Prerequisites

- Node.js `24.x` and Yarn `4.13.0` (enable it with Corepack)
- A running JumpServer API server that the development server can reach
- Optionally, the terminal and AI services (KoKo, Luna, Kael) for the features that use them

### Run locally

```sh
git clone https://github.com/jumpserver/lina.git
cd lina

corepack enable
yarn install

cp .env.development.example .env.development
```

Edit `.env.development` and point the services at your environment:

```dotenv
VITE_CORE_HOST = 'http://localhost:8080'
VITE_KOKO_HOST = 'http://localhost:5050'
VITE_LUNA_HOST = 'http://127.0.0.1:3000'
VITE_KAEL_HOST = 'http://localhost:8083'
```

Start the development server and open `http://localhost:9528/ui/`:

```sh
yarn serve
```

The development server proxies API, WebSocket, and service traffic to the addresses above. Sign in with a JumpServer account that has the permissions you want to test.

### Commands

| Command | Purpose |
| --- | --- |
| `yarn serve` (or `yarn dev`) | Start the development server on port 9528 |
| `yarn build:prod` | Build for production into `lina/` |
| `yarn build:stage` | Build for staging |
| `yarn preview` | Preview the built output on port 9526 |
| `yarn test` | Run the Node.js tests in `tests/` |
| `yarn lint` | Lint `src` and `vite.config.js` with oxlint |
| `yarn fix` | Fix lint issues and format with oxfmt |
| `yarn fmt:check` | Check formatting without writing |
| `yarn vue-i18n-report` | Report missing or unused i18n keys |
| `yarn diff-i18n` | Compare `en`, `ja`, and `zh_Hant` translations |
| `yarn apply-i18n` | Apply translations across the same locales |

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_PUBLIC_PATH` | `/ui/` | Base path the application is served from |
| `VITE_BASE_API` | empty | Prefix added to API requests |
| `VITE_CORE_HOST` | `http://127.0.0.1:8080` | JumpServer API server, proxied for `/api/`, `/core/`, `/static/`, `/media/`, `/private-media/`, `/ws/`, and `/facelive/` |
| `VITE_KOKO_HOST` | `http://127.0.0.1:5050` | KoKo terminal service, proxied at `/koko/` |
| `VITE_LUNA_HOST` | `http://127.0.0.1:3000` | Luna frontend, proxied at `/luna/` |
| `VITE_KAEL_HOST` | `http://127.0.0.1:8083` | Kael AI service, proxied at `/kael/` |
| `VITE_LOGIN_PATH` | `/core/auth/login/` | External login endpoint |
| `VITE_LOGOUT_PATH` | `/core/auth/logout/` | External logout endpoint |
| `VITE_APP_ENV` | `NODE_ENV` | Application environment label (defaults to `NODE_ENV`) |

The development proxy also forwards `/chen/` to `127.0.0.1:9523` and `/guacamole/` to `127.0.0.1:8081`; these targets are fixed in `vite.config.js`.

## Deployment

Build the bundle with `yarn build:prod`, or download a release archive from [Releases](https://github.com/jumpserver/lina/releases). The build writes a static bundle to `lina/`. Serve it under `/ui/` and route the API and service prefixes to their backends. A minimal Nginx site for the static bundle looks like this:

```nginx
server {
  listen 80;

  location /ui/ {
    try_files $uri / /ui/index.html;
    alias /opt/lina/;
  }

  location / {
    rewrite ^/(.*)$ /ui/$1 last;
  }
}
```

The official [`jumpserver/web`](https://github.com/jumpserver/docker-web) image serves Lina at `/ui/` and routes the API and service prefixes for the whole platform. To deploy JumpServer as a whole, use the official [Installer](https://github.com/jumpserver/installer) rather than deploying Lina alone.

To build the container image, use the provided `Dockerfile`. It builds from the `jumpserver/lina-base` image:

```sh
docker build --build-arg VERSION=v5.x.y -t jumpserver/lina:v5.x.y .
```

## Browser compatibility

| Browser | Fully supported | Partially supported |
| --- | --- | --- |
| Chrome / Edge | 109+ | 97–108 |
| Firefox | 115+ | 96–114 |
| Safari | 16+ | 15.x |

Partially supported browsers must still handle the main workflows; minor styling differences that do not block an operation are acceptable.

The build target is configured in `vite.config.js`, and the CSS prefix range is configured in the `browserslist` field of `package.json`; keep the two in sync when the support range changes. Missing runtime APIs are provided by `src/utils/browser-polyfills.js`, so the Vite syntax transform alone is not sufficient.

Before a release, verify login, organization switching, table operations, form submission, dialogs, and session entry points with a production build on both the lowest supported versions and the lowest fully supported versions. A successful build does not replace browser acceptance testing.

## Project structure

```text
src/api          API clients grouped by domain
src/components   Shared UI, including Form/DataForm and Table/ListTable
src/layout       Navbar, side menu, and the Generic* page orchestrators
src/router       Permission-gated route definitions for each view
src/store        Vuex modules such as users, app, permission, and settings
src/views        Feature pages for console, PAM, audit, workbench, and more
src/i18n         Locale messages for ten languages
tests            Node.js test checks
docs             Engineering notes on tree loading, drawer navigation, and authorization
```

Additional engineering notes live in [`docs/`](docs/); they are currently written in Chinese.

## Contributing

Contributions are welcome. See the [JumpServer contributing guide](https://github.com/jumpserver/jumpserver/blob/dev/CONTRIBUTING.md) for the general process.

Before opening a pull request:

1. Branch from `dev` and keep the change focused.
2. Run `yarn fix` and `yarn test`.
3. Use a Conventional Commit prefix such as `feat:`, `fix:`, `perf:`, or `style:`.
4. Put user-facing strings in `src/i18n/langs` and render them through `$t` or `$tc`.

Pull requests are reviewed by the JumpServer team, and an automated code review workflow is configured for pull requests.

## License

Copyright (c) 2014-2026 FIT2CLOUD, All rights reserved.

Licensed under the GNU General Public License version 3 (GPLv3), consistent with the [JumpServer main repository](https://github.com/jumpserver/jumpserver). See [LICENSE](LICENSE) for the full license text.

## Acknowledgments

- [Vue](https://vuejs.org) — the frontend framework
- [Element Plus](https://element-plus.org) — the component library
- [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin) — the original project scaffold

The name Lina comes from the Dota hero [Lina](https://www.dota2.com/hero/lina).

