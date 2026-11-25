<div align="center">

## JumpServer Web 管理介面

[English](../README.md) · [中文(简体)](README.zh-hans.md) · [中文(繁體)](README.zh-hant.md)

</div>

## 什麼是 Lina？

Lina 是 [JumpServer](https://github.com/jumpserver/jumpserver) 的 Web 管理介面。JumpServer 是開源特權訪問管理（PAM）平台。管理員透過 Lina 統一管理資產、帳號、權限、會話、審計記錄、工單和系統設置；使用者透過 Lina 使用已授權的資產、檔案、作業和個人憑據。

Lina 是一個 Vue 3 單頁應用。它負責渲染管理控制台，呼叫 JumpServer API 伺服器（Core）取得資料並校驗權限，並透過其他 JumpServer 組件建立終端與連線會話：

- [Luna](https://github.com/jumpserver/luna) — Web 終端與資產連線工作區
- [KoKo](https://github.com/jumpserver/koko) — SSH、Telnet、WinRM、Kubernetes 和資料庫連接器
- [Chen](https://github.com/jumpserver/chen) — 資料庫工作區
- [Kael](https://github.com/jumpserver/kael) — AI 能力

Lina 不能獨立運行，需要可訪問的 JumpServer API 伺服器。Lina 隨 JumpServer 一同發布，請使用與 JumpServer API 伺服器相同的版本。

## 主要介面

| 介面 | 功能範圍 |
| --- | --- |
| **控制台** | 儀表盤；使用者和使用者組；資產、網域和標籤；帳號、虛擬帳號和帳號範本；資產授權；ACL 與審批設置 |
| **PAM** | PAM 儀表盤、帳號列表、自動化（帳號發現、帳號推送、帳號備份和連線測試）、安全設定（改密和風險檢測）、整合和帳號活動 |
| **工作台** | 概覽；我的資產、檔案傳輸、個人憑據和檔案管理；作業中心（快捷命令、作業管理、範本和執行歷史）；系統工具 |
| **工單** | 我的工單、與我相關的工單、工單列表和審批流設計器 |
| **審計台** | 儀表盤；會話審計和在線會話；命令、檔案傳輸、登入、操作、改密、作業和工單日誌；審計報告（控制台、PAM、審計、資產、帳號和使用者） |
| **系統設置** | 基礎設置、組織、角色、平台、AI 助手、通知、功能、認證、儲存、組件、安全、介面、許可證和小程式 |
| **個人設置** | 個人資料、密碼與 SSH 金鑰、安全、Passkeys、訪問金鑰、令牌、Agent/MCP 和偏好設置 |

## 特性

- **權限驅動導航** — 選單和路由根據 API 返回的權限動態生成，每個使用者只能看到並使用自己有權訪問的介面和操作。
- **多組織** — API 請求透過 `X-JMS-ORG` 請求頭限定在當前組織，使用者無需登出即可切換組織。
- **AI 與 MCP** — 能夠呼叫平台能力完成任務的 AI 助手，以及 MCP 用戶端授權和接入指引，並提供專門的審計介面。
- **國際化** — 支援英語、簡體中文、繁體中文、日語、韓語、西班牙語、法語、巴西葡萄牙語、俄語和越南語。
- **配置驅動 UI** — 表和表單由欄位元資料生成，頁面佈局複用共享的 `Generic*` 編排組件。

## 技術棧

| 領域 | 選型 |
| --- | --- |
| 框架 | Vue 3.5 |
| UI 組件 | Element Plus 2 |
| 構建 | Vite 8 |
| 狀態管理 | Vuex 4 |
| 路由 | Vue Router 5（hash 模式，`/ui/`） |
| 國際化 | vue-i18n 11 |
| HTTP | axios |
| 程式碼檢查與格式化 | oxlint 和 oxfmt |
| 工具鏈 | Node.js 24 和 Yarn 4 |

## 快速開始

### 前置條件

- Node.js `24.x` 和 Yarn `4.13.0`（透過 Corepack 啟用）
- 一個正在運行、且開發伺服器可以訪問的 JumpServer API 伺服器
- 可選：使用相關功能時需要可訪問的終端與 AI 服務（KoKo、Luna、Kael）

### 本地運行

```sh
git clone https://github.com/jumpserver/lina.git
cd lina

corepack enable
yarn install

cp .env.development.example .env.development
```

修改 `.env.development`，將各服務指向你的環境：

```dotenv
VITE_CORE_HOST = 'http://localhost:8080'
VITE_KOKO_HOST = 'http://localhost:5050'
VITE_LUNA_HOST = 'http://127.0.0.1:3000'
VITE_KAEL_HOST = 'http://localhost:8083'
```

啟動開發伺服器，並開啟 `http://localhost:9528/ui/`：

```sh
yarn serve
```

開發伺服器會將 API、WebSocket 和服務流量代理到上述地址。請使用擁有待驗證權限的 JumpServer 帳號登入。

### 常用命令

| 命令 | 說明 |
| --- | --- |
| `yarn serve`（或 `yarn dev`） | 在 9528 端口啟動開發伺服器 |
| `yarn build:prod` | 構建生產版本，輸出到 `lina/` |
| `yarn build:stage` | 構建預發布版本 |
| `yarn preview` | 在 9526 端口預覽構建產物 |
| `yarn test` | 運行 `tests/` 下的 Node.js 測試 |
| `yarn lint` | 使用 oxlint 檢查 `src` 和 `vite.config.js` |
| `yarn fix` | 修復 lint 問題並使用 oxfmt 格式化 |
| `yarn fmt:check` | 僅檢查格式，不寫入檔案 |
| `yarn vue-i18n-report` | 報告缺失或未使用的 i18n key |
| `yarn diff-i18n` | 對比 `en`、`ja` 和 `zh_Hant` 翻譯 |
| `yarn apply-i18n` | 在這些語言之間應用翻譯 |

### 環境變量

| 變量 | 預設值 | 說明 |
| --- | --- | --- |
| `VITE_PUBLIC_PATH` | `/ui/` | 應用的訪問基礎路徑 |
| `VITE_BASE_API` | 空 | API 請求前綴 |
| `VITE_CORE_HOST` | `http://127.0.0.1:8080` | JumpServer API 伺服器，代理 `/api/`、`/core/`、`/static/`、`/media/`、`/private-media/`、`/ws/` 和 `/facelive/` |
| `VITE_KOKO_HOST` | `http://127.0.0.1:5050` | KoKo 終端服務，代理 `/koko/` |
| `VITE_LUNA_HOST` | `http://127.0.0.1:3000` | Luna 前端，代理 `/luna/` |
| `VITE_KAEL_HOST` | `http://127.0.0.1:8083` | Kael AI 服務，代理 `/kael/` |
| `VITE_LOGIN_PATH` | `/core/auth/login/` | 外部登入介面 |
| `VITE_LOGOUT_PATH` | `/core/auth/logout/` | 外部登出介面 |
| `VITE_APP_ENV` | `NODE_ENV` | 應用環境標識（預設取 `NODE_ENV`） |

開發代理還會將 `/chen/` 轉發到 `127.0.0.1:9523`，將 `/guacamole/` 轉發到 `127.0.0.1:8081`；這兩個目標固定在 `vite.config.js` 中。

## 部署

可以透過 `yarn build:prod` 構建，也可以從 [Releases](https://github.com/jumpserver/lina/releases) 下載發布包。構建會將靜態產物輸出到 `lina/`。將其部署在 `/ui/` 路徑下，並將 API 和服務前綴轉發到對應的後端。一個最小的 Nginx 靜態站點配置如下：

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

官方 [`jumpserver/web`](https://github.com/jumpserver/docker-web) 映像會在 `/ui/` 下提供 Lina，並為整個平台轉發 API 和服務前綴。部署完整 JumpServer 時，請使用官方 [Installer](https://github.com/jumpserver/installer)，而不是單獨部署 Lina。

如需構建容器映像，請使用倉庫中的 `Dockerfile`，它基於 `jumpserver/lina-base` 映像：

```sh
docker build --build-arg VERSION=v5.x.y -t jumpserver/lina:v5.x.y .
```

## 瀏覽器兼容

| 瀏覽器 | 完全兼容 | 部分兼容 |
| --- | --- | --- |
| Chrome / Edge | 109+ | 97–108 |
| Firefox | 115+ | 96–114 |
| Safari | 16+ | 15.x |

部分兼容的瀏覽器仍需保證主要功能正常，允許存在不影響操作的輕微樣式差異。

構建目標在 `vite.config.js` 中配置，CSS 前綴範圍在 `package.json` 的 `browserslist` 欄位中配置；調整兼容範圍時需要同步修改。缺失的執行時 API 由 `src/utils/browser-polyfills.js` 補齊，不能只依賴 Vite 的語法轉換。

發布前需使用生產構建，在最低支援版本及完全兼容的最低版本上驗證登入、組織切換、表格操作、表單提交、彈窗和會話入口。構建成功不能替代瀏覽器驗收。

## 項目結構

```text
src/api         按領域劃分的 API 客戶端
src/components  共享 UI，包括 Form/DataForm 和 Table/ListTable
src/layout      導航欄、側邊選單和 Generic* 頁面編排組件
src/router      各介面的權限路由定義
src/store       users、app、permission、settings 等 Vuex 模組
src/views       控制台、PAM、審計、工作台等業務頁面
src/i18n        十種語言的翻譯文案
tests           Node.js 測試檢查
docs            樹載入、抽屜導航和授權樹等工程說明
```

更多工程說明位於 [`docs/`](../docs/)，目前使用中文編寫。

## 參與貢獻

歡迎參與貢獻。通用流程請參閱 [JumpServer 貢獻指南](https://github.com/jumpserver/jumpserver/blob/dev/CONTRIBUTING.md)。

提交 Pull Request 之前：

1. 從 `dev` 分支建立分支，並保持改動聚焦。
2. 運行 `yarn fix` 和 `yarn test`。
3. 使用 `feat:`、`fix:`、`perf:` 或 `style:` 等 Conventional Commit 前綴。
4. 使用者可見文案放在 `src/i18n/langs` 中，並透過 `$t` 或 `$tc` 渲染。

Pull Request 由 JumpServer 團隊審核，並會為 Pull Request 配置自動化程式碼審查工作流。

## 許可證

Copyright (c) 2014-2026 FIT2CLOUD, All rights reserved.

本項目基於 GNU General Public License version 3（GPLv3）許可，與 [JumpServer 主倉庫](https://github.com/jumpserver/jumpserver)一致。完整許可文本請參閱 [LICENSE](../LICENSE)。

## 致謝

- [Vue](https://cn.vuejs.org) — 前端框架
- [Element Plus](https://element-plus.org/zh-CN/) — 組件庫
- [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin) — 項目腳手架

專案名稱 Lina 取自 Dota 英雄莉娜。

