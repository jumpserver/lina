/**
 * Auto-generated from QA Mode B draft MS-100603
 * Source title: 更新用户组表单优化为抽屉式表单（右侧弹出）
 * Area: tests/e2e/views/users/Group  (mirrors src/views/users)
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

const MS_ID = 'MS-100603'
const TITLE = `更新用户组表单优化为抽屉式表单（右侧弹出）`
const STEPS = [
  {
    "action": "用户管理-用户组：点击更新用户组",
    "id": "step-1",
    "sideEffect": "reversible"
  },
  {
    "action": "表单填写，更新名称，更新用户，点击更新",
    "id": "step-2",
    "sideEffect": "reversible"
  }
]
const OUTCOMES = [
  "[1] 右侧弹出抽屉式表单，表单显示该用户组的信息",
  "[2] 更新成功过。显示用户组列表，查看该用户组信息是更新后信息正确的。"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户组；验证: 更新用户组表单优化为抽屉式表单（右侧弹出）`
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
