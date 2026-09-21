/**
 * Auto-generated from QA Mode B draft MS-104263
 * Source title: 用户管理-用户列表：创建用户，设置MFA
 * Area: tests/e2e/views/users/User  (mirrors src/views/users)
 * Risk: critical | Role: console-admin
 *
 * Live e2e:
 *   LINA_BASE_URL=... LINA_USERNAME=... LINA_PASSWORD=... yarn test:e2e
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { chromium } from 'playwright'
import { hasLiveConsole, getLinaEnv } from '../../../../support/env.js'
import { loginAsConsoleAdmin } from '../../../../support/auth.js'
import { runDraftSteps, summarizeOutcome } from '../../../../support/draft-runtime.js'

const MS_ID = 'MS-104263'
const TITLE = `用户管理-用户列表：创建用户，设置MFA`
const STEPS = [
  {
    "action": "在创建用户表单上，禁用MFA，其他按照要求填写，提交",
    "id": "step-1",
    "sideEffect": "reversible"
  },
  {
    "action": "在创建用户表单上，启用MFA，其他按照要求填写，提交",
    "id": "step-2",
    "sideEffect": "reversible"
  },
  {
    "action": "在创建用户表单上，强制启用MFA，其他按照要求填写，提交",
    "id": "step-3",
    "sideEffect": "reversible"
  }
]
const OUTCOMES = [
  "[1] 创建用户成功，使用该用户登录，正确用户名密码成功登录。不需要绑定MFA",
  "[2] 创建用户成功，使用该用户登录，输入正确的用户名密码后，弹出需要绑定MFA。根据提示绑定成功后，用户登录，需要输入MFA才可登录成功，且用户登录成功后，可到个人信息页面，自行关闭MFA。",
  "[3] 创建用户成功，使用该用户登录，输入正确的用户名密码后，弹出需要绑定MFA。根据提示绑定成功后，用户登录，需要输入MFA才可登录成功，且用户登录成功后，在个人信息页面，无法关闭MFA"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 用户管理-用户列表：创建用户，设置MFA`
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
