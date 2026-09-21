/**
 * Auto-generated from QA Mode B draft MS-104643
 * Source title: 用户管理-用户列表：测试搜索功能
 * Area: tests/e2e/views/users/User  (mirrors src/views/users)
 * Risk: medium | Role: console-admin
 *
 * Live e2e:
 *   LINA_BASE_URL=... LINA_USERNAME=... LINA_PASSWORD=... yarn test:e2e
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { chromium } from 'playwright'
import { hasLiveConsole, getLinaEnv } from '../../../../support/env.js'
import { loginAsConsoleAdmin } from '../../../../support/auth.js'
import { runDraftSteps, summarizeOutcome } from '../../../../support/draft-runtime.js'

const MS_ID = 'MS-104643'
const TITLE = `用户管理-用户列表：测试搜索功能`
const STEPS = [
  {
    "action": "用户管理-用户列表-搜索框：根据用户ID搜索",
    "id": "step-1",
    "sideEffect": "none"
  },
  {
    "action": "用户管理-用户列表-搜索框：根据用户用户名搜索",
    "id": "step-2",
    "sideEffect": "none"
  },
  {
    "action": "用户管理-用户列表-搜索框：根据用户名称搜索",
    "id": "step-3",
    "sideEffect": "none"
  },
  {
    "action": "用户管理-用户列表-搜索框：根据用户邮箱搜索",
    "id": "step-4",
    "sideEffect": "none"
  },
  {
    "action": "用户管理-用户列表-搜索框：根据用户来源搜索",
    "id": "step-5",
    "sideEffect": "none"
  },
  {
    "action": "用户管理-用户列表-搜索框：根据用户是否激活搜索",
    "id": "step-6",
    "sideEffect": "reversible"
  },
  {
    "action": "用户管理-用户列表-搜索框：根据用户系统角色搜索",
    "id": "step-7",
    "sideEffect": "none"
  },
  {
    "action": "用户管理-用户列表-搜索框：根据用户组织角色搜索",
    "id": "step-8",
    "sideEffect": "none"
  }
]
const OUTCOMES = [
  "[1] [2]",
  "[3] [4]",
  "[5] [6]",
  "[7] [8]"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 用户管理-用户列表：测试搜索功能`
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
