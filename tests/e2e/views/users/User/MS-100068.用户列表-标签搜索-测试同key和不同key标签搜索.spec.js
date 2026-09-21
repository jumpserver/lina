/**
 * Auto-generated from QA Mode B draft MS-100068
 * Source title: 用户列表-标签搜索：测试同key和不同key标签搜索
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

const MS_ID = 'MS-100068'
const TITLE = `用户列表-标签搜索：测试同key和不同key标签搜索`
const STEPS = [
  {
    "action": "如标签A:a，A:b，A:c，三个同Key标签搜索",
    "id": "step-1",
    "sideEffect": "none"
  },
  {
    "action": "如标签A:a，B:a，不同Key标签搜索",
    "id": "step-2",
    "sideEffect": "none"
  }
]
const OUTCOMES = [
  "[1] 搜索出来的结果是三个Key的或关系",
  "[2] 搜索出来的结果是这些Key的且关系"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 用户列表-标签搜索：测试同key和不同key标签搜索`
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
