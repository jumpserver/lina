# lina tests

测试目录与 `src/views/users` 对齐，由 Desktop `qa-mode-b` Draft 全量生成。

## 结构

```
tests/
  *.test.mjs                 # 既有 node:test（保留）
  support/                   # env / auth / draft-runtime
  fixtures/qa-mode-b/        # Mode B 摘要快照
  unit/views/users/          # 单元：全量 Draft 清单契约
  e2e/views/users/
    User/                    # 用户列表/创建/更新等 e2e
    User/UserDetail/         # 用户详情 e2e
    Group/                   # 用户组 e2e
    Role/                    # 角色 e2e（如有）
    _unmapped/               # 暂未归类
    _skipped/                # 源用例无步骤，显式 skip（15）
```

## 命令

```bash
yarn test:node       # 既有 node:test
yarn test:unit       # Vitest 单元
yarn test:e2e        # Vitest + Playwright e2e（无 LINA_BASE_URL 时只跑契约，跳过 live）
yarn test            # test:node + test:unit
yarn tests:codegen   # 从 ~/Desktop/qa-mode-b 重新生成
```

## 真机 e2e

```bash
export LINA_BASE_URL=https://your-jumpserver
export LINA_USERNAME=admin
export LINA_PASSWORD='***'
yarn test:e2e
```

说明：MeterSphere 步骤是自然语言，生成用例默认 `soft` 映射（记录步骤、不臆造脆弱选择器）。后续可按页面逐步硬化 locator。
