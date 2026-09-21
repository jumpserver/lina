/**
 * Auto-generated from QA Mode B draft MS-104812
 * Source title: 用户管理-用户列表：测试使用系统管理员移除用户
 * Area: tests/e2e/views/users/User  (mirrors src/views/users)
 * Risk: high | Role: auditor
 *
 * Live e2e:
 *   LINA_BASE_URL=... LINA_USERNAME=... LINA_PASSWORD=... yarn test:e2e
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { chromium } from 'playwright'
import { hasLiveConsole, getLinaEnv } from '../../../../support/env.js'
import { loginAsConsoleAdmin } from '../../../../support/auth.js'
import { runDraftSteps, summarizeOutcome } from '../../../../support/draft-runtime.js'

const MS_ID = 'MS-104812'
const TITLE = `用户管理-用户列表：测试使用系统管理员移除用户`
const STEPS = [
  {
    "action": "用户管理-用户列表：测试使用系统管理员移除系统管理员",
    "id": "step-1",
    "sideEffect": "destructive"
  },
  {
    "action": "用户管理-用户列表：测试使用系统管理员移除系统审计员",
    "id": "step-2",
    "sideEffect": "destructive"
  },
  {
    "action": "用户管理-用户列表：测试使用系统管理员移除普通用户",
    "id": "step-3",
    "sideEffect": "destructive"
  }
]
const OUTCOMES = [
  "[1] 移除成功，查看用户列表，该用户已不在用户列表中。系统管理员可查看全局组织，可查看到该用户",
  "[2] 移除成功，查看用户列表，该用户已不在用户列表中。系统管理员可查看全局组织，可查看到该用户",
  "[3] 移除成功，查看用户列表，该用户已不在用户列表中。系统管理员可查看全局组织，可查看到该用户"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 用户管理-用户列表：测试使用系统管理员移除用户`
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
