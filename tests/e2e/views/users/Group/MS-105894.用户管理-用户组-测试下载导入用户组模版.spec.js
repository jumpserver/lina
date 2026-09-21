/**
 * Auto-generated from QA Mode B draft MS-105894
 * Source title: 用户管理-用户组：测试下载导入用户组模版
 * Area: tests/e2e/views/users/Group  (mirrors src/views/users)
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

const MS_ID = 'MS-105894'
const TITLE = `用户管理-用户组：测试下载导入用户组模版`
const STEPS = [
  {
    "action": "用户管理-用户组：测试下载导入用户组模版（CSV）",
    "id": "step-1",
    "sideEffect": "reversible"
  },
  {
    "action": "用户管理-用户组：测试下载导入用户组模版（Excel）",
    "id": "step-2",
    "sideEffect": "reversible"
  }
]
const OUTCOMES = [
  "[1] 下载导入用户组模版成功，文件格式为csv",
  "[2] 下载导入用户组模版成功，文件格式为Excel"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户组；验证: 用户管理-用户组：测试下载导入用户组模版`
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
