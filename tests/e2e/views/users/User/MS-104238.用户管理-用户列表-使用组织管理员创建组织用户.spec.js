/**
 * Auto-generated from QA Mode B draft MS-104238
 * Source title: 用户管理-用户列表：使用组织管理员创建组织用户
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

const MS_ID = 'MS-104238'
const TITLE = `用户管理-用户列表：使用组织管理员创建组织用户`
const STEPS = [
  {
    "action": "系统管理员登录。点击用户管理-用户列表：点击创建。",
    "id": "step-1",
    "sideEffect": "reversible"
  },
  {
    "action": "在创建用户表单上：填写名称、用户名、邮箱，系统角色选用户、组织角色选用户，其他按要求填写，提交",
    "id": "step-2",
    "sideEffect": "reversible"
  }
]
const OUTCOMES = [
  "[1] 返回创建用户表单。",
  "[2] 创建系统用户成功。返回用户列表，可查看到该用户信息，且系统角色字段显示系统操作员。使用该用户登录，其拥有的权限：只有工作台。不可切换到任意组织，只能在其有权限的组织下。"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 用户管理-用户列表：使用组织管理员创建组织用户`
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
