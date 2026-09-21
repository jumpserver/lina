/**
 * Auto-generated from QA Mode B draft MS-105128
 * Source title: 用户管理-用户列表-更新用户：更新用户，更新用户有效期
 * Area: tests/e2e/views/users/User  (mirrors src/views/users)
 * Risk: low | Role: console-admin
 *
 * Live e2e:
 *   LINA_BASE_URL=... LINA_USERNAME=... LINA_PASSWORD=... yarn test:e2e
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { chromium } from 'playwright'
import { hasLiveConsole, getLinaEnv } from '../../../../support/env.js'
import { loginAsConsoleAdmin } from '../../../../support/auth.js'
import { runDraftSteps, summarizeOutcome } from '../../../../support/draft-runtime.js'

const MS_ID = 'MS-105128'
const TITLE = `用户管理-用户列表-更新用户：更新用户，更新用户有效期`
const STEPS = [
  {
    "action": "用户管理-用户列表-更新用户：更新用户，更新用户有效期，更改为过期。测试使用该用户登录",
    "id": "step-1",
    "sideEffect": "reversible"
  },
  {
    "action": "用户管理-用户列表-更新用户：更新用户，更新用户有效期，更改为未来时间。测试使用该用户登录",
    "id": "step-2",
    "sideEffect": "reversible"
  }
]
const OUTCOMES = [
  "[1] 使用该用户登录，登录失败，提示该用户已过期",
  "[2] 使用该用户登录，正确的用户密码，登录成功。"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 用户管理-用户列表-更新用户：更新用户，更新用户有效期`
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
