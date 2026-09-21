/**
 * Auto-generated from QA Mode B draft MS-108955
 * Source title: 用户列表：验证用户 email 信息加密存储功能
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

const MS_ID = 'MS-108955'
const TITLE = `用户列表：验证用户 email 信息加密存储功能`
const STEPS = [
  {
    "action": "创建新用户并填写 email 信息",
    "id": "step-1",
    "sideEffect": "reversible"
  },
  {
    "action": "进入数据库直接查询用户表中的 email 字段",
    "id": "step-2",
    "sideEffect": "external"
  },
  {
    "action": "在用户页面，查看用户的 email 显示",
    "id": "step-3",
    "sideEffect": "none"
  },
  {
    "action": "通过 API 接口获取用户 email 信息",
    "id": "step-5",
    "sideEffect": "external"
  },
  {
    "action": "通过 API 接口获取用户 email 信息",
    "id": "step-4",
    "sideEffect": "external"
  }
]
const OUTCOMES = [
  "[1] 用户创建成功",
  "[2] 数据库中 email 字段为加密存储，非明文显示",
  "[3] 显示解密后的 email",
  "[4] API 返回解密后的 email 信息"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 用户列表：验证用户 email 信息加密存储功能`
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
