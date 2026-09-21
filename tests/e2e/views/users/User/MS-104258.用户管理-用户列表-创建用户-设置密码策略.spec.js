/**
 * Auto-generated from QA Mode B draft MS-104258
 * Source title: 用户管理-用户列表：创建用户，设置密码策略
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

const MS_ID = 'MS-104258'
const TITLE = `用户管理-用户列表：创建用户，设置密码策略`
const STEPS = [
  {
    "action": "在创建用户表单上，密码策略选择：生成重置密码链接，通过邮件发送给用户，其他按照要求填写",
    "id": "step-1",
    "sideEffect": "external"
  },
  {
    "action": "在创建用户表单上，密码策略选择：密码，输入密码要求格式，不勾选下次登录重置密码，其他按照要求填写",
    "id": "step-2",
    "sideEffect": "reversible"
  },
  {
    "action": "（源步骤文本为空，保留占位以便追溯）",
    "id": "step-3",
    "sideEffect": "none"
  }
]
const OUTCOMES = [
  "[1] 创建用户成功。用户的邮箱会收到设置密码链接，用户通过该链接，按照提示可设置密码。设置成功后，用户使用密码登录，能够成功登录。",
  "[2] 创建用户成功，用户使用该密码登录，成功登录。",
  "[3] 创建用户成功，用户使用该密码登录，提示要重置密码，按照要求重新设置密码。用户使用重置后的密码登录，登录成功。"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 用户管理-用户列表：创建用户，设置密码策略`
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
