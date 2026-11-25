<div align="center">

## JumpServer Web 管理界面

[English](../README.md) · [中文(简体)](README.zh-hans.md) · [中文(繁體)](README.zh-hant.md)

</div>

## 什么是 Lina？

Lina 是 [JumpServer](https://github.com/jumpserver/jumpserver) 的 Web 管理界面。JumpServer 是开源特权访问管理（PAM）平台。管理员通过 Lina 统一管理资产、账号、权限、会话、审计记录、工单和系统设置；用户通过 Lina 使用已授权的资产、文件、作业和个人凭据。

Lina 是一个 Vue 3 单页应用。它负责渲染管理控制台，调用 JumpServer API 服务器（Core）获取数据并校验权限，并通过其他 JumpServer 组件建立终端与连接会话：

- [Luna](https://github.com/jumpserver/luna) — Web 终端与资产连接工作区
- [KoKo](https://github.com/jumpserver/koko) — SSH、Telnet、WinRM、Kubernetes 和数据库连接器
- [Chen](https://github.com/jumpserver/chen) — 数据库工作区
- [Kael](https://github.com/jumpserver/kael) — AI 能力

Lina 不能独立运行，需要可访问的 JumpServer API 服务器。Lina 随 JumpServer 一同发布，请使用与 JumpServer API 服务器相同的版本。

## 主要界面

| 界面 | 功能范围 |
| --- | --- |
| **控制台** | 仪表盘；用户和用户组；资产、网域和标签；账号、虚拟账号和账号模板；资产授权；ACL 与审批设置 |
| **PAM** | PAM 仪表盘、账号列表、自动化（账号发现、账号推送、账号备份和连接测试）、安全设置（改密和风险检测）、集成和账号活动 |
| **工作台** | 概览；我的资产、文件传输、个人凭据和文件管理；作业中心（快捷命令、作业管理、模板和执行历史）；系统工具 |
| **工单** | 我的工单、与我相关的工单、工单列表和审批流设计器 |
| **审计台** | 仪表盘；会话审计和在线会话；命令、文件传输、登录、操作、改密、作业和工单日志；审计报告（控制台、PAM、审计、资产、账号和用户） |
| **系统设置** | 基础设置、组织、角色、平台、AI 助手、通知、功能、认证、存储、组件、安全、界面、许可证和小程序 |
| **个人设置** | 个人资料、密码与 SSH 密钥、安全、Passkeys、访问密钥、令牌、Agent/MCP 和偏好设置 |

## 特性

- **权限驱动导航** — 菜单和路由根据 API 返回的权限动态生成，每个用户只能看到并使用自己有权访问的界面和操作。
- **多组织** — API 请求通过 `X-JMS-ORG` 请求头限定在当前组织，用户无需退出登录即可切换组织。
- **AI 与 MCP** — 能够调用平台能力完成任务的 AI 助手，以及 MCP 客户端授权和接入指引，并提供专门的审计界面。
- **国际化** — 支持英语、简体中文、繁体中文、日语、韩语、西班牙语、法语、巴西葡萄牙语、俄语和越南语。
- **配置驱动 UI** — 表单和表格由字段元数据生成，页面布局复用共享的 `Generic*` 编排组件。

## 技术栈

| 领域 | 选型 |
| --- | --- |
| 框架 | Vue 3.5 |
| UI 组件 | Element Plus 2 |
| 构建 | Vite 8 |
| 状态管理 | Vuex 4 |
| 路由 | Vue Router 5（hash 模式，`/ui/`） |
| 国际化 | vue-i18n 11 |
| HTTP | axios |
| 代码检查与格式化 | oxlint 和 oxfmt |
| 工具链 | Node.js 24 和 Yarn 4 |

## 快速开始

### 前置条件

- Node.js `24.x` 和 Yarn `4.13.0`（通过 Corepack 启用）
- 一个正在运行、且开发服务器可以访问的 JumpServer API 服务器
- 可选：使用相关功能时需要可访问的终端与 AI 服务（KoKo、Luna、Kael）

### 本地运行

```sh
git clone https://github.com/jumpserver/lina.git
cd lina

corepack enable
yarn install

cp .env.development.example .env.development
```

修改 `.env.development`，将各服务指向你的环境：

```dotenv
VITE_CORE_HOST = 'http://localhost:8080'
VITE_KOKO_HOST = 'http://localhost:5050'
VITE_LUNA_HOST = 'http://127.0.0.1:3000'
VITE_KAEL_HOST = 'http://localhost:8083'
```

启动开发服务器，并打开 `http://localhost:9528/ui/`：

```sh
yarn serve
```

开发服务器会将 API、WebSocket 和服务流量代理到上述地址。请使用拥有待验证权限的 JumpServer 账号登录。

### 常用命令

| 命令 | 说明 |
| --- | --- |
| `yarn serve`（或 `yarn dev`） | 在 9528 端口启动开发服务器 |
| `yarn build:prod` | 构建生产版本，输出到 `lina/` |
| `yarn build:stage` | 构建预发布版本 |
| `yarn preview` | 在 9526 端口预览构建产物 |
| `yarn test` | 运行 `tests/` 下的 Node.js 测试 |
| `yarn lint` | 使用 oxlint 检查 `src` 和 `vite.config.js` |
| `yarn fix` | 修复 lint 问题并使用 oxfmt 格式化 |
| `yarn fmt:check` | 仅检查格式，不写入文件 |
| `yarn vue-i18n-report` | 报告缺失或未使用的 i18n key |
| `yarn diff-i18n` | 对比 `en`、`ja` 和 `zh_Hant` 翻译 |
| `yarn apply-i18n` | 在这些语言之间应用翻译 |

### 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_PUBLIC_PATH` | `/ui/` | 应用的访问基础路径 |
| `VITE_BASE_API` | 空 | API 请求前缀 |
| `VITE_CORE_HOST` | `http://127.0.0.1:8080` | JumpServer API 服务器，代理 `/api/`、`/core/`、`/static/`、`/media/`、`/private-media/`、`/ws/` 和 `/facelive/` |
| `VITE_KOKO_HOST` | `http://127.0.0.1:5050` | KoKo 终端服务，代理 `/koko/` |
| `VITE_LUNA_HOST` | `http://127.0.0.1:3000` | Luna 前端，代理 `/luna/` |
| `VITE_KAEL_HOST` | `http://127.0.0.1:8083` | Kael AI 服务，代理 `/kael/` |
| `VITE_LOGIN_PATH` | `/core/auth/login/` | 外部登录接口 |
| `VITE_LOGOUT_PATH` | `/core/auth/logout/` | 外部登出接口 |
| `VITE_APP_ENV` | `NODE_ENV` | 应用环境标识（默认取 `NODE_ENV`） |

开发代理还会将 `/chen/` 转发到 `127.0.0.1:9523`，将 `/guacamole/` 转发到 `127.0.0.1:8081`；这两个目标固定在 `vite.config.js` 中。

## 部署

可以通过 `yarn build:prod` 构建，也可以从 [Releases](https://github.com/jumpserver/lina/releases) 下载发布包。构建会将静态产物输出到 `lina/`。将其部署在 `/ui/` 路径下，并将 API 和服务前缀转发到对应的后端。一个最小的 Nginx 静态站点配置如下：

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

官方 [`jumpserver/web`](https://github.com/jumpserver/docker-web) 镜像会在 `/ui/` 下提供 Lina，并为整个平台转发 API 和服务前缀。部署完整 JumpServer 时，请使用官方 [Installer](https://github.com/jumpserver/installer)，而不是单独部署 Lina。

如需构建容器镜像，请使用仓库中的 `Dockerfile`，它基于 `jumpserver/lina-base` 镜像：

```sh
docker build --build-arg VERSION=v5.x.y -t jumpserver/lina:v5.x.y .
```

## 浏览器兼容

| 浏览器 | 完全兼容 | 部分兼容 |
| --- | --- | --- |
| Chrome / Edge | 109+ | 97–108 |
| Firefox | 115+ | 96–114 |
| Safari | 16+ | 15.x |

部分兼容的浏览器仍需保证主要功能正常，允许存在不影响操作的轻微样式差异。

构建目标在 `vite.config.js` 中配置，CSS 前缀范围在 `package.json` 的 `browserslist` 字段中配置；调整兼容范围时需要同步修改。缺失的运行时 API 由 `src/utils/browser-polyfills.js` 补齐，不能只依赖 Vite 的语法转换。

发布前需使用生产构建，在最低支持版本及完全兼容的最低版本上验证登录、组织切换、表格操作、表单提交、弹窗和会话入口。构建成功不能替代浏览器验收。

## 项目结构

```text
src/api         按领域划分的 API 客户端
src/components  共享 UI，包括 Form/DataForm 和 Table/ListTable
src/layout      导航栏、侧边菜单和 Generic* 页面编排组件
src/router      各界面的权限路由定义
src/store       users、app、permission、settings 等 Vuex 模块
src/views       控制台、PAM、审计、工作台等业务页面
src/i18n        十种语言的翻译文案
tests           Node.js 测试检查
docs            树加载、抽屉导航和授权树等工程说明
```

更多工程说明位于 [`docs/`](../docs/)，目前使用中文编写。

## 参与贡献

欢迎参与贡献。通用流程请参阅 [JumpServer 贡献指南](https://github.com/jumpserver/jumpserver/blob/dev/CONTRIBUTING.md)。

提交 Pull Request 之前：

1. 从 `dev` 分支创建分支，并保持改动聚焦。
2. 运行 `yarn fix` 和 `yarn test`。
3. 使用 `feat:`、`fix:`、`perf:` 或 `style:` 等 Conventional Commit 前缀。
4. 用户可见文案放在 `src/i18n/langs` 中，并通过 `$t` 或 `$tc` 渲染。

Pull Request 由 JumpServer 团队审核，并会为 Pull Request 配置自动化代码审查工作流。

## 许可证

Copyright (c) 2014-2026 FIT2CLOUD, All rights reserved.

本项目基于 GNU General Public License version 3（GPLv3）许可，与 [JumpServer 主仓库](https://github.com/jumpserver/jumpserver)一致。完整许可文本请参阅 [LICENSE](../LICENSE)。

## 致谢

- [Vue](https://cn.vuejs.org) — 前端框架
- [Element Plus](https://element-plus.org/zh-CN/) — 组件库
- [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin) — 项目脚手架

项目名称 Lina 取自 Dota 英雄莉娜。

