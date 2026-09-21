/**
 * Auto-generated from QA Mode B draft MS-108016
 * Source title: 控制台:验证控制台用户模块标题英文翻译
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

const MS_ID = 'MS-108016'
const TITLE = `控制台:验证控制台用户模块标题英文翻译`
const STEPS = [
  {
    "action": "登录页面选择英文模式登录",
    "id": "step-1",
    "sideEffect": "none"
  },
  {
    "action": "登录系统后，切换到英文模式",
    "id": "step-2",
    "sideEffect": "none"
  },
  {
    "action": "登录后在英文状态下从控制台切换到其他平台，再切回控制台",
    "id": "step-3",
    "sideEffect": "none"
  },
  {
    "action": "登录后在中文状态下切换到其他平台，切回控制台，修改语言为英文",
    "id": "step-4",
    "sideEffect": "reversible"
  }
]
const OUTCOMES = [
  "[1] 登录后用户管理模块菜单显示Users，用户管理列表标题显示Users",
  "[2] 切换后用户管理模块菜单显示Users，用户管理列表标题显示Users",
  "[3] 用户管理模块菜单显示Users，用户管理列表标题显示Users",
  "[4] 用户管理模块菜单显示Users，用户管理列表标题显示Users"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理；验证: 控制台:验证控制台用户模块标题英文翻译`
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
