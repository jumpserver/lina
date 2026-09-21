# Mode B 转换报告

## 结论
- **通过**：IR → test-case Draft 转换完成；Schema 校验 95/95 通过。
- Runtime：`@gwinnguyen/qa-skills@1.0.3` compatible=True
- 未引入 vitest，未改 lina 依赖，未提交 git。

## 数量
- irCases: 110
- converted: 95
- skipped: 15
- schemaValid: 95
- schemaInvalid: 0

## 跳过（无步骤，无法满足 steps.minItems=1）
- MS-101486: 用户列表-批量更新-更新完自动关闭更新窗口
- MS-105138: 用户管理-用户列表-更新用户：更新用户来源信息
- MS-105290: 用户管理-用户列表-详情页-基本信息tab:查看用户的基本信息
- MS-105328: 用户管理-用户列表-详情页-基本信息tab-快速更新：开启/关闭激活
- MS-105366: 用户管理-用户列表-详情页-基本信息tab-快速更新：重置MFA
- MS-105422: 用户管理-用户列表-详情页-基本信息tab-快速更新：重置密码
- MS-105461: 用户管理-用户列表-详情页-基本信息tab-快速更新：重置SSH密钥
- MS-105531: 用户管理-用户列表-详情页-基本信息tab-快速更新：解锁用户
- MS-105586: 用户管理-用户列表-详情页-基本信息tab-用户组：添加/删除用户组
- MS-105601: 用户管理-用户列表-详情页-基本信息tab：右上角更新按钮
- MS-105694: 用户管理-用户列表-详情页-用户登录规则：
- MS-105702: 用户管理-用户列表-详情页-基本信息tab：右上角删除按钮
- MS-105765: 用户管理-用户列表-详情页-授权的资产tab：获取授权的资产信息
- MS-105786: 用户管理-用户列表-详情页-授权的账号tab：获取授权的账号信息
- MS-105883: 用户管理-用户列表-详情页-资产授权规则tab：获取资产授权规则

## 产物路径
- 目录: `~/Desktop/qa-mode-b/`
- 摘要: `mode-b-summary.json`
- Drafts: `drafts/MS-*.json` + `.provenance.json`
- Skipped: `skipped/`
- Schema: `test-case.schema.json`
- IR: `testcase-ir.json`

## 说明
- 按 `testcase-designer`：只产出 QA Skills `test-case` Draft，不生成 Playwright/Vitest 代码。
- MeterSphere ID 保留为 `testCaseId=MS-<id>`，并写入 provenance 侧车（因 Schema additionalProperties=false）。
- 预期结果折叠进 `coverage.outcome`；前置条件进入 steps（`前置条件:` 前缀，sideEffect=none）。