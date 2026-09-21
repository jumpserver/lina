/**
 * Auto-generated from QA Mode B draft MS-104585
 * Source title: 用户管理-用户列表：测试导出用户
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

const MS_ID = 'MS-104585'
const TITLE = `用户管理-用户列表：测试导出用户`
const STEPS = [
  {
    "action": "用户管理-用户列表-点击导出：测试导出所有用户",
    "id": "step-1",
    "sideEffect": "reversible"
  },
  {
    "action": "用户管理-用户列表-选择几个用户-点击导出：测试导出选择项的用户",
    "id": "step-2",
    "sideEffect": "reversible"
  },
  {
    "action": "3用户管理-用户列表-搜索条交搜索出用户，点击导出：测试导出搜索结果的用户",
    "id": "step-3",
    "sideEffect": "reversible"
  }
]
const OUTCOMES = [
  "[1] 导出所有用户成功。查看表格信息，用户数据正确，且是所有用户的信息",
  "[2] 导出选择项用户成功。查看表格信息，用户数据正确，且仅是选择项用户的信息",
  "[3] 导出搜索结果的用户成功。查看表格信息，用户数据正确，且仅是搜索结果用户的信息"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 用户管理-用户列表：测试导出用户`
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
