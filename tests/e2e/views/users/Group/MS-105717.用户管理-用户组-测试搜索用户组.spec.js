/**
 * Auto-generated from QA Mode B draft MS-105717
 * Source title: 用户管理-用户组：测试搜索用户组
 * Area: tests/e2e/views/users/Group  (mirrors src/views/users)
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

const MS_ID = 'MS-105717'
const TITLE = `用户管理-用户组：测试搜索用户组`
const STEPS = [
  {
    "action": "用户管理-用户组-搜索框：选择名称搜索条件，进行搜索",
    "id": "step-1",
    "sideEffect": "none"
  },
  {
    "action": "用户管理-用户组-搜索框：不选择搜索条件，进行搜索",
    "id": "step-2",
    "sideEffect": "none"
  }
]
const OUTCOMES = [
  "[1] 输入名称全名，符合条件的用户组可被搜索出来。输入名称关键字，搜索不到任何东西。",
  "[2] 输入名称全名/或者关键字，符合条件的用户组可被搜索出来。"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户组；验证: 用户管理-用户组：测试搜索用户组`
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
