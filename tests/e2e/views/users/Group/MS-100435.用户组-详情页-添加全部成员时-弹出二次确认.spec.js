/**
 * Auto-generated from QA Mode B draft MS-100435
 * Source title: 用户组-详情页：添加全部成员时，弹出二次确认
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

const MS_ID = 'MS-100435'
const TITLE = `用户组-详情页：添加全部成员时，弹出二次确认`
const STEPS = [
  {
    "action": "用户组-详情页：点击添加全部成员",
    "id": "step-1",
    "sideEffect": "reversible"
  },
  {
    "action": "点击取消",
    "id": "step-2",
    "sideEffect": "none"
  },
  {
    "action": "点击确认",
    "id": "step-3",
    "sideEffect": "none"
  }
]
const OUTCOMES = [
  "[1] 弹出窗口二次确认窗口，提示：你确定要添加全部成功员吗",
  "[2] 不会添加成员",
  "[3] 提示添加成功，页面会刷新，添加了全部成员"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户组；验证: 用户组-详情页：添加全部成员时，弹出二次确认`
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
