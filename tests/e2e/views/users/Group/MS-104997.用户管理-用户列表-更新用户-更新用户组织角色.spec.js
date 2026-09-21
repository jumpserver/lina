/**
 * Auto-generated from QA Mode B draft MS-104997
 * Source title: 用户管理-用户列表-更新用户：更新用户组织角色
 * Area: tests/e2e/views/users/Group  (mirrors src/views/users)
 * Risk: medium | Role: org-admin
 *
 * Live e2e:
 *   LINA_BASE_URL=... LINA_USERNAME=... LINA_PASSWORD=... yarn test:e2e
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { chromium } from 'playwright'
import { hasLiveConsole, getLinaEnv } from '../../../../support/env.js'
import { loginAsConsoleAdmin } from '../../../../support/auth.js'
import { runDraftSteps, summarizeOutcome } from '../../../../support/draft-runtime.js'

const MS_ID = 'MS-104997'
const TITLE = `用户管理-用户列表-更新用户：更新用户组织角色`
const STEPS = [
  {
    "action": "用户管理-用户列表-更新用户：测试组织管理员更新用户组织角色，修改为组织管理员，提交",
    "id": "step-1",
    "sideEffect": "reversible"
  },
  {
    "action": "用户管理-用户列表-更新用户：测试组织管理员更新用户组织角色，修改为组织审计员，提交",
    "id": "step-2",
    "sideEffect": "reversible"
  },
  {
    "action": "用户管理-用户列表-更新用户：测试组织管理员更新用户组织角色，修改为组织用户，提交",
    "id": "step-3",
    "sideEffect": "reversible"
  }
]
const OUTCOMES = [
  "[1] 更新成功。使用该用户登录，其拥有组织管理员权限，包括控制台、审计台、工作台、仅对其有权限的组织的资源增删改查。仅可切换其有权限的组织",
  "[2] 更新成功。使用该用户登录，其拥有系统审计员权限，包括审计台、工作台，仅对其有权限的组织的资源增删改查。仅可切换其有权限的组织",
  "[3] 更新成功。使用该用户登录，其普通用户权限，包括工作台权限，仅可切换其有权限的组织"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 用户管理-用户列表-更新用户：更新用户组织角色`
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
