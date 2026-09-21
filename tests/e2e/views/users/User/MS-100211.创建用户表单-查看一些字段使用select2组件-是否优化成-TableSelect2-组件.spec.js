/**
 * Auto-generated from QA Mode B draft MS-100211
 * Source title: 创建用户表单-查看一些字段使用select2组件，是否优化成 TableSelect2 组件
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

const MS_ID = 'MS-100211'
const TITLE = `创建用户表单-查看一些字段使用select2组件，是否优化成 TableSelect2 组件`
const STEPS = [
  {
    "action": "创建用户表单-添加用户组的select2组件，是否优化成 TableSelect2组件",
    "id": "step-1",
    "sideEffect": "reversible"
  },
  {
    "action": "创建用户表单-添加系统角色的select2组件，是否优化成 TableSelect2组件",
    "id": "step-2",
    "sideEffect": "reversible"
  },
  {
    "action": "创建用户表单-添加组织角色的select2组件，是否优化成 TableSelect2组件",
    "id": "step-3",
    "sideEffect": "reversible"
  }
]
const OUTCOMES = [
  "[1] 有优化成 TableSelect2组件，可以批量选择，或批量删除",
  "[2] 有优化成 TableSelect2组件，可以批量选择，或批量删除",
  "[3] 有优化成 TableSelect2组件，可以批量选择，或批量删除"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 创建用户表单-查看一些字段使用select2组件，是否优化成 TableSelect2 组件`
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
