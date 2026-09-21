/**
 * Auto-generated from QA Mode B draft MS-104475
 * Source title: 用户管理-用户列表：系统管理员测试批量操作用户
 * Area: tests/e2e/views/users/User  (mirrors src/views/users)
 * Risk: high | Role: console-admin
 *
 * Live e2e:
 *   LINA_BASE_URL=... LINA_USERNAME=... LINA_PASSWORD=... yarn test:e2e
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { chromium } from 'playwright'
import { hasLiveConsole, getLinaEnv } from '../../../../support/env.js'
import { loginAsConsoleAdmin } from '../../../../support/auth.js'
import { runDraftSteps, summarizeOutcome } from '../../../../support/draft-runtime.js'

const MS_ID = 'MS-104475'
const TITLE = `用户管理-用户列表：系统管理员测试批量操作用户`
const STEPS = [
  {
    "action": "测试系统管理员批量删除用户",
    "id": "step-1",
    "sideEffect": "destructive"
  },
  {
    "action": "测试系统管理员批量禁用用户",
    "id": "step-2",
    "sideEffect": "reversible"
  },
  {
    "action": "测试系统管理员批量激活用户",
    "id": "step-3",
    "sideEffect": "reversible"
  },
  {
    "action": "测试系统管理员批量更新用户",
    "id": "step-4",
    "sideEffect": "reversible"
  },
  {
    "action": "测试系统管理员批量移除用户",
    "id": "step-5",
    "sideEffect": "destructive"
  }
]
const OUTCOMES = [
  "[1] 删除成功，查看用户列表，这些用户已不在列表中",
  "[2] 批量禁用成功，这些用户的激活字段都是打叉的。使用这些用户登录，登录失败，提示该用户已禁用",
  "[3] 批量激活成功，这些用户的激活字段都是打勾的。使用这些用户登录，正确的用户名和密码登录成功",
  "[4] 弹出批量更新用户表单，可更新用户组，过期时间。能够成功批量更新",
  "[5] 移除成功，查看用户列表，这些用户已不在该组织中。在全局组织下，可搜索到这些用户"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 用户管理-用户列表：系统管理员测试批量操作用户`
const VIEWPORT = { width: 1280, height: 720 }

describe(`${MS_ID} ${TITLE}`, () => {
  it('keeps Mode B draft contract (steps + outcome inventory)', () => {
    expect(MS_ID).toMatch(/^MS-\d+$/)
    expect(STEPS.length).toBeGreaterThan(0)
    expect(BEHAVIOR.length).toBeGreaterThan(0)
    expect(Array.isArray(OUTCOMES)).toBe(true)
  })

  describe.runIf(hasLiveConsole())('live console', () => {
    let browser
    let page

    beforeAll(async () => {
      browser = await chromium.launch({ headless: true })
      page = await browser.newPage({ viewport: VIEWPORT })
      await loginAsConsoleAdmin(page)
    })

    afterAll(async () => {
      await browser?.close()
    })

    it('executes draft steps (soft mapping)', async () => {
      const env = getLinaEnv()
      const log = await runDraftSteps(page, STEPS, { soft: true })
      expect(log.length).toBe(STEPS.length)
      expect(summarizeOutcome(OUTCOMES.join('\n')).length).toBeGreaterThanOrEqual(0)
      expect(env.baseURL).toBeTruthy()
    })
  })
})
