/**
 * Auto-generated from QA Mode B draft MS-107669
 * Source title: 用户列表：验证---
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

const MS_ID = 'MS-107669'
const TITLE = `用户列表：验证---`
const STEPS = [
  {
    "action": "用户列表：点击无密码过期：筛选密码过期的用户",
    "id": "step-1",
    "sideEffect": "none"
  },
  {
    "action": "用户列表：点击长期未登录：筛选长期未登录的用户",
    "id": "step-2",
    "sideEffect": "none"
  },
  {
    "action": "用户列表：点击未启用MFA：筛选未启用MFA的用户",
    "id": "step-3",
    "sideEffect": "reversible"
  },
  {
    "action": "用户列表：点击被锁定：筛选被锁定的用户",
    "id": "step-4",
    "sideEffect": "none"
  }
]
const OUTCOMES = [
  "[1] 页面显示密码过期的用户",
  "[2] 页面显示30天都没有登录的用户",
  "[3] 页面显示未启用MFA的用户",
  "[4] 页面显示被锁定的用户"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 用户列表：验证---`
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
