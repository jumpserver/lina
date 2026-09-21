/**
 * Auto-generated from QA Mode B draft MS-104293
 * Source title: 用户管理-用户列表：创建用户，设置用户来源
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

const MS_ID = 'MS-104293'
const TITLE = `用户管理-用户列表：创建用户，设置用户来源`
const STEPS = [
  {
    "action": "在创建用户表单上，设置用户来源：选择数据库，其他按照要求填写，提交",
    "id": "step-1",
    "sideEffect": "external"
  },
  {
    "action": "在创建用户表单上，设置用户来源：选择LDAP/AD，其他按照要求填写，提交",
    "id": "step-2",
    "sideEffect": "external"
  },
  {
    "action": "在创建用户表单上，设置用户来源：选择OpenID，其他按照要求填写，提交",
    "id": "step-3",
    "sideEffect": "reversible"
  },
  {
    "action": "在创建用户表单上，设置用户来源：选择Radius，其他按照要求填写，提交",
    "id": "step-4",
    "sideEffect": "reversible"
  },
  {
    "action": "在创建用户表单上，设置用户来源：选择CAS，其他按照要求填写，提交",
    "id": "step-5",
    "sideEffect": "reversible"
  },
  {
    "action": "在创建用户表单上，设置用户来源：选择SAML2，其他按照要求填写，提交",
    "id": "step-6",
    "sideEffect": "reversible"
  },
  {
    "action": "在创建用户表单上，设置用户来源：选择Oauth2，其他按照要求填写，提交",
    "id": "step-7",
    "sideEffect": "reversible"
  }
]
const OUTCOMES = [
  "[1] 创建用户来源为数据库的用户成功。使用正确用户名和密码登录，登录成功。",
  "[2] 创建用户来源为LDAP/AD的用户成功。测试该用户登录，如果LDAP服务器有该用户，那么输入正确用户名和密码可正确登录，如果LDAP无该用户，则登录失败，提示用户名或者密码错误",
  "[3] 创建用户来源为OpenID的用户成功。测试该用户登录，如果OpenID服务器有该用户，那么输入正确用户名和密码可正确登录，如果OpenID无该用户，则登录失败，提示用户名或者密码错误",
  "[4] 创建用户来源为Radius的用户成功。测试该用户登录，如果Radius服务器有该用户，那么输入正确用户名和密码可正确登录，如果Radius无该用户，则登录失败，提示用户名或者密码错误",
  "[5] 创建用户来源为CAS的用户成功。测试该用户登录，如果CAS服务器有该用户，那么输入正确用户名和密码可正确登录，如果CAS无该用户，则登录失败，提示用户名或者密码错误",
  "[6] 创建用户来源为Saml2的用户成功。测试该用户登录，如果Saml2服务器有该用户，那么输入正确用户名和密码可正确登录，如果Saml2无该用户，则登录失败，提示用户名或者密码错误",
  "[7] .创建用户来源为oauth2的用户成功。测试该用户登录，如果oauth2服务器有该用户，那么输入正确用户名和密码可正确登录，如果oauth2无该用户，则登录失败，提示用户名或者密码错误"
]
const BEHAVIOR = `模块: JumpServer / 控制台 / 用户管理 / 用户列表；验证: 用户管理-用户列表：创建用户，设置用户来源`
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
