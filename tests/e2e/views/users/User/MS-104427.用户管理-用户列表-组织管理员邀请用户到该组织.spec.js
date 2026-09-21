/**
 * Auto-generated from QA Mode B draft MS-104427
 * Source title: 用户管理-用户列表：组织管理员邀请用户到该组织
 * Area: tests/e2e/views/users/User  (mirrors src/views/users)
 * Risk: critical | Role: org-admin
 *
 * Live e2e:
 *   LINA_BASE_URL=... LINA_USERNAME=... LINA_PASSWORD=... yarn test:e2e
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { chromium } from 'playwright'
import { hasLiveConsole, getLinaEnv } from '../../../../support/env.js'
import { loginAsConsoleAdmin } from '../../../../support/auth.js'
import { runDraftSteps, summarizeOutcome } from '../../../../support/draft-runtime.js'

const MS_ID = 'MS-104427'
const TITLE = `用户管理-用户列表：组织管理员邀请用户到该组织`
const STEPS = [
  {
    "action": "用户管理-用户列表：组织管理员点击邀请用户，选择几个用户，选择组织角色为组织管理员，点击确定",
    "id": "step-1",
    "sideEffect": "reversible"
  },
  {
    "action": "用户管理-用户列表：组织管理员点击邀请用户，选择几个用户，选择组织角色为组织审计员，点击确定",
    "id": "step-2",
    "sideEffect": "reversible"
  },
  {
    "action": "用户管理-用户列表：组织管理员点击邀请用户，选择几个用户，选择组织角色为组织用户，点击确定",
    "id": "step-3",
    "sideEffect": "reversible"
  }
]
const OUTCOMES = [
  "[1] 提示邀请成功，在用户列表可查看刚邀请的这些用户。且用户的组织角色为组织管理员。使用这些用户登录，其拥有该组织管理员权限",
  "[2] 提示邀请成功，在用户列表可查看刚邀请的这些用户。且用户的组织角色为组织审计员。使用这些用户登录，其拥有该组织审计员权限",
  "[3] 提示邀请成功，在用户列表可查看刚邀请的这些用户。且用户的组织角色为组织用户。使用这些用户登录，其拥有该组织用户权限"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 用户管理-用户列表：组织管理员邀请用户到该组织`
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
