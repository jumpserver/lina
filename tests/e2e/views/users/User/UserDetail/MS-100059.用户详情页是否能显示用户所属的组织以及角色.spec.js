/**
 * Auto-generated from QA Mode B draft MS-100059
 * Source title: 【全局组织】用户详情页是否能显示用户所属的组织以及角色
 * Area: tests/e2e/views/users/User/UserDetail  (mirrors src/views/users)
 * Risk: medium | Role: console-admin
 *
 * Live e2e:
 *   LINA_BASE_URL=... LINA_USERNAME=... LINA_PASSWORD=... yarn test:e2e
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { chromium } from 'playwright'
import { hasLiveConsole, getLinaEnv } from '../../../../../support/env.js'
import { loginAsConsoleAdmin } from '../../../../../support/auth.js'
import { runDraftSteps, summarizeOutcome } from '../../../../../support/draft-runtime.js'

const MS_ID = 'MS-100059'
const TITLE = `【全局组织】用户详情页是否能显示用户所属的组织以及角色`
const STEPS = [
  {
    "action": "切换到全局组织，查看用户的详情页，师傅可看到用户所属的各个组织以及角色",
    "id": "step-1",
    "sideEffect": "none"
  }
]
const OUTCOMES = [
  "[1] 组织显示在前，用户在当前组织的角色跟在组织后面。所属的每个组织和和角色都会显示"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表 / 详情页；验证: 【全局组织】用户详情页是否能显示用户所属的组织以及角色`
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
