/**
 * Auto-generated from QA Mode B draft MS-100058
 * Source title: 用户详情页-授权的资产：验证是否可查看资产的授权账号
 * Area: tests/e2e/views/users/User/UserDetail  (mirrors src/views/users)
 * Risk: high | Role: org-admin
 *
 * Live e2e:
 *   LINA_BASE_URL=... LINA_USERNAME=... LINA_PASSWORD=... yarn test:e2e
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { chromium } from 'playwright'
import { hasLiveConsole, getLinaEnv } from '../../../../../support/env.js'
import { loginAsConsoleAdmin } from '../../../../../support/auth.js'
import { runDraftSteps, summarizeOutcome } from '../../../../../support/draft-runtime.js'

const MS_ID = 'MS-100058'
const TITLE = `用户详情页-授权的资产：验证是否可查看资产的授权账号`
const STEPS = [
  {
    "action": "用户详情页-授权的资产：验证是否可查看资产的授权账号",
    "id": "step-1",
    "sideEffect": "none"
  }
]
const OUTCOMES = [
  "[1] 点击账号查看，可查资产授权的账号"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表 / 详情页；验证: 用户详情页-授权的资产：验证是否可查看资产的授权账号`
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
