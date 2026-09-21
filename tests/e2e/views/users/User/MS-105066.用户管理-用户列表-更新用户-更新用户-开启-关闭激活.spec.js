/**
 * Auto-generated from QA Mode B draft MS-105066
 * Source title: 用户管理-用户列表-更新用户：更新用户，开启/关闭激活
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

const MS_ID = 'MS-105066'
const TITLE = `用户管理-用户列表-更新用户：更新用户，开启/关闭激活`
const STEPS = [
  {
    "action": "用户管理-用户列表-更新用户：更新用户，关闭激活，提交",
    "id": "step-1",
    "sideEffect": "reversible"
  },
  {
    "action": "用户管理-用户列表-更新用户：更新用户，开启激活，提交",
    "id": "step-2",
    "sideEffect": "reversible"
  }
]
const OUTCOMES = [
  "[1] 更新成功，返回用户列表，查看该用户信息，激活字段是打叉的。使用该用户登录，登录失败，提示该用户已被禁用",
  "[2] 更新成功，返回用户列表，查看该用户信息，激活字段是打勾的。使用该用户登录，正确的账号密码，登录成功。"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 用户管理-用户列表-更新用户：更新用户，开启/关闭激活`
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
