import { normalizeEmailSettings, prepareTestSettings, runSettingsTest } from '@/views/settings/testSettings'
import { encryptPassword } from '@/utils/session-encrypt'

jest.mock('@/utils/session-encrypt', () => ({
  encryptPassword: jest.fn(value => `encrypted:${value}`)
}))

function feedback() {
  return { $t: value => value, $message: { success: jest.fn(), error: jest.fn() } }
}

function loadComponent(file, imports = {}) {
  const fs = require('fs')
  const path = require('path')
  const source = fs.readFileSync(path.join(process.cwd(), 'src/views/settings', file), 'utf8')
  const script = source.split('<script>')[1].split('</script>')[0]
  const code = require('@babel/core').transformSync(script, {
    babelrc: false, configFile: false,
    presets: [[require.resolve('@babel/preset-env'), { targets: { node: 'current' }, modules: 'commonjs' }]]
  }).code
  const module = { exports: {} }
  require('vm').runInNewContext(code, {
    module, exports: module.exports,
    require: name => imports[name] || {}
  })
  return module.exports.default
}

beforeEach(() => jest.clearAllMocks())

describe('Draft configuration preparation', () => {
  it.each([
    ['none', false, false], ['ssl', true, false], ['tls', false, true]
  ])('normalizes email %s without changing the draft', (protocol, ssl, tls) => {
    const draft = { EMAIL_SECURITY_PROTOCOL: protocol, EMAIL_HOST_PASSWORD: 'new', nested: { value: 1 } }
    const data = prepareTestSettings(draft, ['EMAIL_HOST_PASSWORD'], normalizeEmailSettings)
    expect(data.EMAIL_USE_SSL).toBe(ssl)
    expect(data.EMAIL_USE_TLS).toBe(tls)
    expect(data.EMAIL_HOST_PASSWORD).toBe('encrypted:new')
    expect(data.EMAIL_SECURITY_PROTOCOL).toBeUndefined()
    data.nested.value = 2
    expect(draft).toEqual({ EMAIL_SECURITY_PROTOCOL: protocol, EMAIL_HOST_PASSWORD: 'new', nested: { value: 1 } })
  })

  it('omits unchanged secrets but retains ordinary false, zero and blank fields', () => {
    const data = prepareTestSettings({
      SECRET: '', OTHER_SECRET: null, ENABLED: false, PORT: 0, PROXY: ''
    }, ['SECRET', 'OTHER_SECRET', 'MISSING_SECRET'])
    expect(data).toEqual({ ENABLED: false, PORT: 0, PROXY: '' })
    expect(encryptPassword).not.toHaveBeenCalled()
  })
})

describe('Test button lifecycle', () => {
  it('validates, snapshots the draft, blocks duplicate clicks and restores loading', async () => {
    const vm = feedback()
    const button = { loading: false }
    const value = { SECRET: 'new' }
    let validated
    let complete
    const form = { validate: callback => { validated = callback } }
    const request = jest.fn(() => new Promise(resolve => { complete = resolve }))
    const options = { value, form, button, request, encryptedFields: ['SECRET'] }
    const pending = runSettingsTest(vm, options)
    expect(button.loading).toBe(true)
    await runSettingsTest(vm, options)
    expect(request).not.toHaveBeenCalled()
    value.SECRET = 'edited while testing'
    validated(true)
    await Promise.resolve()
    expect(request).toHaveBeenCalledWith({ SECRET: 'encrypted:new' })
    complete({ msg: 'passed' })
    await pending
    expect(button.loading).toBe(false)
    expect(vm.$message.success).toHaveBeenCalledWith('passed')
    expect(value.SECRET).toBe('edited while testing')
  })

  it('stops invalid forms without making a request', async () => {
    const button = { loading: false }
    const request = jest.fn()
    await runSettingsTest(feedback(), {
      value: {}, form: { validate: cb => cb(false) }, button, request
    })
    expect(request).not.toHaveBeenCalled()
    expect(button.loading).toBe(false)
  })

  it.each([
    [{ response: { data: { SECRET: ['Required'] } } }, 'SECRET: Required'],
    [new Error('Network timeout'), 'Network timeout']
  ])('shows request errors and restores loading', async (error, message) => {
    const vm = feedback()
    const button = { loading: false }
    await runSettingsTest(vm, {
      value: {}, form: { validate: cb => cb(true) }, button,
      request: () => Promise.reject(error)
    })
    expect(button.loading).toBe(false)
    expect(vm.$message.error).toHaveBeenCalledWith(message)
  })

  it('restores loading when encryption fails before sending', async () => {
    encryptPassword.mockImplementationOnce(() => { throw new Error('Encryption failed') })
    const vm = feedback()
    const request = jest.fn()
    const button = { loading: false }
    await runSettingsTest(vm, {
      value: { SECRET: 'new' }, form: { validate: cb => cb(true) },
      button, request, encryptedFields: ['SECRET']
    })
    expect(request).not.toHaveBeenCalled()
    expect(button.loading).toBe(false)
    expect(vm.$message.error).toHaveBeenCalledWith('Encryption failed')
  })
})

describe('Settings page wiring', () => {
  it('SMS combines the live parent code length and current child provider draft', async () => {
    const parent = loadComponent('Msg/SMS/index.vue')
    let parentDraft = { SMS_CODE_LENGTH: 8, SMS_ENABLED: false }
    const provided = parent.provide.call({
      $refs: { form: { $refs: { form: { $refs: { dataForm: { getFormValue: () => parentDraft } } } } } }
    })
    const base = loadComponent('Msg/SMS/Base.vue', {
      '@/views/settings/testSettings': { runSettingsTest }
    })
    const vm = {
      ...feedback(), ...provided, config: { encryptedFields: ['ALIBABA_ACCESS_KEY_SECRET'] },
      $axios: { post: jest.fn().mockResolvedValue({ msg: 'passed' }) }, testPerformError: jest.fn()
    }
    const draft = { ALIBABA_ACCESS_KEY_SECRET: 'new', SMS_TEST_PHONE: '+8613800000000' }
    await base.methods.testSettings.call(vm, draft, { validate: cb => cb(true) }, { loading: false }, 'alibaba')
    expect(vm.$axios.post).toHaveBeenCalledWith('/api/v1/settings/sms/alibaba/testing/', {
      ...draft, ALIBABA_ACCESS_KEY_SECRET: 'encrypted:new', SMS_CODE_LENGTH: 8
    }, { disableFlashErrorMsg: true })
    parentDraft = { SMS_CODE_LENGTH: 6 }
    expect(provided.getSMSTestSettings()).toEqual({ SMS_CODE_LENGTH: 6 })
    expect(draft.ALIBABA_ACCESS_KEY_SECRET).toBe('new')
  })

  it.each([
    ['Auth/WeCom.vue', 'wecom'],
    ['Auth/DingTalk.vue', 'dingtalk'],
    ['Auth/FeiShu.vue', 'feishu'],
    ['Auth/FeiShu.vue', 'lark'],
    ['Auth/Slack.vue', 'slack'],
    ['Feature/Chat.vue', 'chatai']
  ])('%s handles test failures without a second global toast (%s)', async (file, category) => {
    const component = loadComponent(file, {
      '@/views/settings/testSettings': { runSettingsTest },
      '@/views/settings/Auth/const': { getOrgSelect2Meta: () => ({}) },
      vuex: { mapGetters: () => ({}) }
    })
    const vm = {
      ...feedback(), category, encryptedFields: [], formFields: [], formFieldsMeta: {},
      $axios: {
        post: jest.fn((url, data, config) => {
          if (!config?.disableFlashErrorMsg) vm.$message.error('Global error')
          return Promise.reject({ response: { data: { detail: 'Service unavailable' } } })
        })
      }
    }
    Object.assign(vm, component.data.call(vm))
    const testButton = (vm.settings || vm).moreButtons[0]
    await testButton.callback({ ENABLED: false }, { validate: cb => cb(true) }, testButton)
    expect(vm.$axios.post).toHaveBeenCalledWith(`/api/v1/settings/${category}/testing/`,
      { ENABLED: false }, { disableFlashErrorMsg: true })
    expect(vm.$message.error).toHaveBeenCalledTimes(1)
    expect(vm.$message.error).toHaveBeenCalledWith('Service unavailable')
    expect(testButton.loading).toBe(false)
  })

  it('SMS retains field errors while showing a failed test only once', async () => {
    const base = loadComponent('Msg/SMS/Base.vue', {
      '@/views/settings/testSettings': { runSettingsTest }
    })
    const fieldError = { SMS_TEST_PHONE: ['Invalid phone number'] }
    const vm = {
      ...feedback(), config: {}, getSMSTestSettings: () => ({}),
      testPerformError: jest.fn(),
      $axios: { post: jest.fn().mockRejectedValue({ response: { data: fieldError } }) }
    }
    const button = { loading: false }
    await base.methods.testSettings.call(vm, {}, { validate: cb => cb(true) }, button, 'alibaba')
    expect(vm.$axios.post.mock.calls[0][2]).toEqual({ disableFlashErrorMsg: true })
    expect(vm.testPerformError).toHaveBeenCalledTimes(1)
    expect(vm.$message.error).toHaveBeenCalledTimes(1)
    expect(vm.$message.error).toHaveBeenCalledWith('SMS_TEST_PHONE: Invalid phone number')
    expect(button.loading).toBe(false)
  })

  it('Chat test visibility follows both initial settings and unsaved mode changes', () => {
    const chat = loadComponent('Feature/Chat.vue', { vuex: { mapGetters: () => ({}) } })
    const vm = feedback()
    Object.assign(vm, chat.data.call(vm))
    vm.afterGetFormValue({ CHAT_AI_METHOD: 'embed' })
    expect(vm.moreButtons[0].hidden()).toBe(true)
    vm.fieldsMeta.CHAT_AI_METHOD.on.change(['api'])
    expect(vm.moreButtons[0].hidden()).toBe(false)
    expect(vm.encryptedFields).toEqual(['GPT_API_KEY', 'DEEPSEEK_API_KEY'])
  })
})
