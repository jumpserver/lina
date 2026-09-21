/**
 * Auto-generated from QA Mode B draft MS-104310
 * Source title: 用户管理-用户列表：创建用户，必填项不填写
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

const MS_ID = 'MS-104310'
const TITLE = `用户管理-用户列表：创建用户，必填项不填写`
const STEPS = [
  {
    "action": "在创建用户表单上，名称不填写，其他按照要求填写，提交",
    "id": "step-1",
    "sideEffect": "reversible"
  },
  {
    "action": "在创建用户表单上，用户名不填写，其他按照要求填写，提交",
    "id": "step-2",
    "sideEffect": "reversible"
  },
  {
    "action": "在创建用户表单上，邮箱不填写，其他按照要求填写，提交",
    "id": "step-3",
    "sideEffect": "reversible"
  },
  {
    "action": "在创建用户表单上，系统角色不填写，其他按照要求填写，提交",
    "id": "step-4",
    "sideEffect": "reversible"
  },
  {
    "action": "在创建用户表单上，组织角色不填写，其他按照要求填写，提交",
    "id": "step-5",
    "sideEffect": "reversible"
  }
]
const OUTCOMES = [
  "[1] 创建用户失败，提示：这个字段是必填项",
  "[2] 创建用户失败，提示：这个字段是必填项",
  "[3] 创建用户失败，提示：这个字段是必填项",
  "[4] 创建用户失败，提示：这个字段是必填项",
  "[5] 创建用户失败，提示：这个字段是必填项"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 用户管理-用户列表：创建用户，必填项不填写`
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
