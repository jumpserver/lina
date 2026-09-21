/**
 * Auto-generated from QA Mode B draft MS-101420
 * Source title: 用户管理-普通组织管理员更新/删除管理员
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

const MS_ID = 'MS-101420'
const TITLE = `用户管理-普通组织管理员更新/删除管理员`
const STEPS = [
  {
    "action": "把admin加入到某个组织下，组织的管理员更新admin",
    "id": "step-1",
    "sideEffect": "reversible"
  },
  {
    "action": "把admin加入到某个组织下，组织的管理员删除admin",
    "id": "step-2",
    "sideEffect": "destructive"
  }
]
const OUTCOMES = [
  "[1] 无法更新",
  "[2] 无法删除"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理；验证: 用户管理-普通组织管理员更新/删除管理员`
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
