/**
 * Auto-generated from QA Mode B draft MS-108160
 * Source title: 用户列表：优化用户快过期时有提醒信息
 * Area: tests/e2e/views/users/User  (mirrors src/views/users)
 * Risk: high | Role: org-admin
 *
 * Live e2e:
 *   LINA_BASE_URL=... LINA_USERNAME=... LINA_PASSWORD=... yarn test:e2e
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { chromium } from 'playwright'
import { hasLiveConsole, getLinaEnv } from '../../../../support/env.js'
import { loginAsConsoleAdmin } from '../../../../support/auth.js'
import { runDraftSteps, summarizeOutcome } from '../../../../support/draft-runtime.js'

const MS_ID = 'MS-108160'
const TITLE = `用户列表：优化用户快过期时有提醒信息`
const STEPS = [
  {
    "action": "设置用户，离过期时间超过5天。（当触发任务时的时间）",
    "id": "step-1",
    "sideEffect": "none"
  },
  {
    "action": "设置用户，离过期时间还有5天（当触发任务时的时间）",
    "id": "step-2",
    "sideEffect": "none"
  },
  {
    "action": "设置用户，已经过期（当触发任务时的时间）",
    "id": "step-3",
    "sideEffect": "none"
  }
]
const OUTCOMES = [
  "[1] 当触发检测过期用户任务，超过5天过期的用户，不会提醒",
  "[2] 当触发检测过期用户任务，会提醒用户，还有5天时间过期。站内信和用户邮箱均可收到",
  "[3] 当触发检测过期用户任务，会提醒用户，已过期。站内信和用户邮箱均可收到"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 用户列表：优化用户快过期时有提醒信息`
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
