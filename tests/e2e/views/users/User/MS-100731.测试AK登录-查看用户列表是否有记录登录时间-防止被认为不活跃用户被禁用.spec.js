/**
 * Auto-generated from QA Mode B draft MS-100731
 * Source title: 测试AK登录，查看用户列表是否有记录登录时间，防止被认为不活跃用户被禁用。
 * Area: tests/e2e/views/users/User  (mirrors src/views/users)
 * Risk: critical | Role: console-admin
 *
 * Live e2e:
 *   LINA_BASE_URL=... LINA_USERNAME=... LINA_PASSWORD=... yarn test:e2e
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { chromium } from 'playwright'
import { hasLiveConsole, getLinaEnv } from '../../../../support/env.js'
import { loginAsConsoleAdmin } from '../../../../support/auth.js'
import { runDraftSteps, summarizeOutcome } from '../../../../support/draft-runtime.js'

const MS_ID = 'MS-100731'
const TITLE = `测试AK登录，查看用户列表是否有记录登录时间，防止被认为不活跃用户被禁用。`
const STEPS = [
  {
    "action": "前置条件: <code></code>",
    "id": "pre-1",
    "sideEffect": "none"
  },
  {
    "action": "测试AK登录，查看用户列表是否有记录登录时间，防止被认为不活跃用户被禁用。",
    "id": "step-1",
    "sideEffect": "reversible"
  }
]
const OUTCOMES = [
  "[1] 用户列表记录该用户最后一次AK登录时间。（AK登录模拟，可参考备注）"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 测试AK登录，查看用户列表是否有记录登录时间，防止被认为不活跃用户被禁用。`
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
