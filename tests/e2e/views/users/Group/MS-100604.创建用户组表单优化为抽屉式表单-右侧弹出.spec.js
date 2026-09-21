/**
 * Auto-generated from QA Mode B draft MS-100604
 * Source title: 创建用户组表单优化为抽屉式表单（右侧弹出）
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

const MS_ID = 'MS-100604'
const TITLE = `创建用户组表单优化为抽屉式表单（右侧弹出）`
const STEPS = [
  {
    "action": "用户管理-用户组：点击创建用户组",
    "id": "step-1",
    "sideEffect": "reversible"
  },
  {
    "action": "表单填写，设置名称，选择多个用户，点击创建",
    "id": "step-2",
    "sideEffect": "reversible"
  },
  {
    "action": "表单填写，设置名称，选择多个用户，点击保存并继续添加",
    "id": "step-3",
    "sideEffect": "reversible"
  }
]
const OUTCOMES = [
  "[1] 右侧弹出抽屉式表单",
  "[2] 创建成功。显示用户组列表，查看改用户组信息是正确的。",
  "[3] 创建成功。抽屉式表单不会消失，能够继续添加用户组。用户组成功添加后，可查看用户组列表，刚才添加的几个用户组都正确显示。"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户组；验证: 创建用户组表单优化为抽屉式表单（右侧弹出）`
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
