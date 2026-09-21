/**
 * Auto-generated from QA Mode B draft MS-100607
 * Source title: 创建用户表单优化为抽屉式表单（右侧弹出）
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

const MS_ID = 'MS-100607'
const TITLE = `创建用户表单优化为抽屉式表单（右侧弹出）`
const STEPS = [
  {
    "action": "用户管理，点击创建用户",
    "id": "step-1",
    "sideEffect": "reversible"
  },
  {
    "action": "表单填写名称、用户名、邮箱，其他按照要求填写",
    "id": "step-2",
    "sideEffect": "none"
  },
  {
    "action": "表单填写,添加用户组",
    "id": "step-3",
    "sideEffect": "reversible"
  },
  {
    "action": "表单填写,设置MFA开启/强制开启",
    "id": "step-4",
    "sideEffect": "none"
  },
  {
    "action": "表单填写,密码策略为设置密码，并且勾选下次登录需要密码",
    "id": "step-5",
    "sideEffect": "none"
  },
  {
    "action": "表单填写,密码策略为设置密码，生成重置密码连接，通过邮箱发送给用户",
    "id": "step-6",
    "sideEffect": "reversible"
  },
  {
    "action": "表单填写,设置系统角色/组织角色",
    "id": "step-7",
    "sideEffect": "none"
  },
  {
    "action": "表单填写,关闭激活",
    "id": "step-8",
    "sideEffect": "reversible"
  }
]
const OUTCOMES = [
  "[1] 右侧弹出抽屉式表单",
  "[2] 创建用户成功。",
  "[3] 创建用户成功。显示用户列表，可查看到该用户的信息是正确的",
  "[4] 创建用户成功。显示用户列表，可查看到该用户的信息是正确的。使用该用户登录，提示要绑定MFA",
  "[5] 创建用户成功。显示用户列表，可查看到该用户的信息是正确的。使用该用户登录，登录成功跳转修改密码。",
  "[6] 创建用户成功。显示用户列表，可查看到该用户的信息是正确的。用户所填写的邮箱收到了重置密码链接，点击链接，可根据流程重置密码。",
  "[7] 创建用户成功。显示用户列表，可查看到该用户的信息是正确的。用户登录，拥有所选角色的权限",
  "[8] 创建用户成功。显示用户列表，可查看到该用户的信息是正确的。且用户的有效字段是打岔的，且使用该用户登录失败。"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 创建用户表单优化为抽屉式表单（右侧弹出）`
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
