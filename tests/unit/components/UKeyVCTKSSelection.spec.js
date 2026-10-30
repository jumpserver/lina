import Vue from 'vue'
import Panel from '@/components/Apps/UKeyPanel/index.vue'
import VCTKSCertificates, { parseCertificateList } from '@/components/Apps/UKeyPanel/vctksCertificates'

jest.mock('@/layout/components/Page/TwoColPage.vue', () => ({}))
jest.mock('@/components/Common/IBox', () => ({}))

const A = { ID: 0, CN: 'same-name', SN: 'AA', Cert: 'Y2VydC1B', issuer: 'CA-A', DN: 'CN=same-name' }
const B = { ID: 1, CN: 'same-name', SN: 'BB', Cert: 'Y2VydC1C', issuer: 'CA-B', DN: 'CN=same-name' }
const FIELD_TYPES = [9, 10, 11, 1, 2, 3, 4, 5, 6, 7, 8, 13]

function sdkFailure(code) {
  throw code // eslint-disable-line no-throw-literal
}

function pluginCertificateList(certificates) {
  return JSON.stringify(certificates.map(({ Cert, ...item }) => JSON.stringify({
    ...item, DevSN: 'test-device', CertUsage: 1, isSM: true, CertData: Cert
  })))
}

function mockDevice(certificates = [A, B]) {
  const state = { certificates, current: null, choice: B, cancelled: false, prompts: 0 }
  const sdk = {
    UKey_CheckInstall: jest.fn(() => 0),
    UKey_GetVersion: jest.fn(() => 'test-version'),
    UKey_GetCertInfoList: jest.fn(() => pluginCertificateList(state.certificates)),
    UKey_SetCurCert: jest.fn((id, cn, sn) => {
      state.current = state.certificates.find(item => Number(item.ID) === id && item.CN === cn && item.SN === sn)
      return state.current ? 0 : 1
    }),
    UKey_GetCert: jest.fn(() => {
      if (state.current) return state.current.Cert
      state.prompts++
      if (state.cancelled) sdkFailure(0x0B000011)
      return state.choice.Cert
    }),
    UKey_GetDevSN: jest.fn(() => 'serial-' + (state.current?.SN || 'unknown')),
    UKey_GetCertInfo: jest.fn(() => 'legacy-field'),
    UKey_GetExtCertInfo: jest.fn((type, cert) => type + ':' + cert),
    UKey_VerifyPIN: jest.fn(() => 0),
    UKey_P7SignAttach: jest.fn(() => 'proof'),
    UKey_ChangePIN: jest.fn(() => 0),
    UKey_UnblockPIN: jest.fn(() => 0)
  }
  return { sdk, state }
}

describe('VCTK_S certificate list and native selection', () => {
  it('accepts the documented fields in arrays or JSON, normalizes IDs and certificate whitespace', () => {
    const input = [{ ...A, ID: '0', Cert: 'Y2Vy\ndC1B' }]
    expect(parseCertificateList(input)[0]).toEqual(A)
    expect(parseCertificateList(JSON.stringify(input))).toEqual([A])
  })

  it('parses the observed response: JSON string entries with CertData and non-contiguous IDs', () => {
    const entries = [{ ...A, ID: 1 }, { ...B, ID: 3 }]
    const response = { exec_status: 0, exec_result: pluginCertificateList(entries) }
    const parsed = parseCertificateList(response.exec_result)
    expect(parsed.map(({ ID, Cert }) => ({ ID, Cert }))).toEqual([
      { ID: 1, Cert: A.Cert }, { ID: 3, Cert: B.Cert }
    ])
    expect(parsed[0].DevSN).toBe('test-device')
    expect(parseCertificateList(JSON.parse(response.exec_result))).toEqual(parsed)
  })

  it('accepts CertData in object entries and matching certificate aliases', () => {
    const { Cert, ...item } = A
    expect(parseCertificateList([{ ...item, CertData: Cert }])[0].Cert).toBe(Cert)
    expect(parseCertificateList([{ ...A, CertData: 'Y2Vy\ndC1B' }])[0].Cert).toBe(Cert)
  })

  it.each([
    ['not-json'], ['null'], ['[]'], [JSON.stringify(JSON.stringify(A))],
    [JSON.stringify({ ...A, Cert: undefined })],
    [JSON.stringify({ ...A, Cert: undefined, CertData: 'invalid!' })],
    [JSON.stringify({ ...A, CertData: B.Cert })],
    [JSON.stringify(A), JSON.stringify({ ...B, ID: A.ID })]
  ])('rejects malformed nested entries or conflicting certificates: %p', input => {
    expect(() => parseCertificateList(JSON.stringify(input))).toThrow('UKeyCertificateListInvalid')
  })

  it('selects the native choice using the reported index rather than its array position', () => {
    const entries = [{ ...A, ID: 1 }, { ...B, ID: 3 }]
    const { sdk, state } = mockDevice(entries)
    const selection = new VCTKSCertificates(sdk)
    expect(selection.select()).toBe(B.Cert)
    expect(sdk.UKey_SetCurCert).toHaveBeenCalledWith(3, B.CN, B.SN)
    sdk.UKey_GetCert.mockClear()
    sdk.UKey_SetCurCert.mockClear()
    for (let i = 0; i < 12; i++) selection.scan()
    expect(selection.selected.Cert).toBe(B.Cert)
    expect(state.prompts).toBe(1)
    expect(sdk.UKey_GetCert).not.toHaveBeenCalled()
    expect(sdk.UKey_SetCurCert).not.toHaveBeenCalled()
  })

  it.each([null, '', '{}', '{}not-json', {}, { certificates: [A] }, [null], [{ ...A, ID: '' }],
    [{ ...A, ID: -1 }], [{ ...A, ID: 0.5 }], [{ ...A, Cert: 'invalid!' }], [{ ...A, CN: null }],
    [{ ...A, SN: '' }], [A, { ...B, ID: 0 }]])('rejects malformed or ambiguous lists: %p', input => {
    expect(() => parseCertificateList(input)).toThrow('UKeyCertificateListInvalid')
  })

  it('selects a single certificate before reading its signing certificate or device serial', () => {
    const { sdk, state } = mockDevice([A])
    const selection = new VCTKSCertificates(sdk)
    expect(selection.select()).toBe(A.Cert)
    expect(state.prompts).toBe(0)
    expect(sdk.UKey_SetCurCert).toHaveBeenCalledWith(0, A.CN, A.SN)
    expect(sdk.UKey_SetCurCert.mock.invocationCallOrder[0]).toBeLessThan(sdk.UKey_GetCert.mock.invocationCallOrder[0])
    expect(selection.serial).toBe('serial-AA')
  })

  it('uses the native result for two same-CN certificates, then retains it across index changes', () => {
    const { sdk, state } = mockDevice()
    const selection = new VCTKSCertificates(sdk)
    expect(selection.select()).toBe(B.Cert)
    expect(state.prompts).toBe(1)
    expect(sdk.UKey_SetCurCert).toHaveBeenCalledWith(1, B.CN, B.SN)
    state.certificates = [{ ...B, ID: 0 }, { ...A, ID: 1 }]
    selection.scan()
    expect(selection.selected.ID).toBe(0)
    selection.select()
    expect(sdk.UKey_SetCurCert).toHaveBeenLastCalledWith(0, B.CN, B.SN)
    expect(state.prompts).toBe(1)
  })

  it('does not choose the first match when duplicate certificate contents are ambiguous', () => {
    const { sdk } = mockDevice([B, { ...B, ID: 2 }])
    const selection = new VCTKSCertificates(sdk)
    expect(() => selection.select()).toThrow('UKeyCertificateSelectionChanged')
    expect(sdk.UKey_SetCurCert).not.toHaveBeenCalled()
  })

  it('never falls back to a different certificate when setting or verifying the selection fails', () => {
    const { sdk, state } = mockDevice([A])
    const selection = new VCTKSCertificates(sdk)
    sdk.UKey_SetCurCert.mockReturnValueOnce(1)
    expect(() => selection.select()).toThrow('UKeyCertificateSelectionFailed')
    expect(sdk.UKey_GetCert).not.toHaveBeenCalled()
    state.current = B
    sdk.UKey_SetCurCert.mockReturnValueOnce(0)
    expect(() => selection.select()).toThrow('UKeyCertificateSelectionChanged')
    expect(selection.selected).toBeNull()
    expect(sdk.UKey_GetDevSN).not.toHaveBeenCalled()
  })

  it('returns empty for no certificate or removal, but reports other SDK errors', () => {
    const { sdk } = mockDevice([])
    const selection = new VCTKSCertificates(sdk)
    expect(selection.select()).toBeNull()
    sdk.UKey_GetCertInfoList.mockImplementationOnce(() => sdkFailure(0x0A000023))
    selection.scan()
    expect(selection.certificates).toEqual([])
    sdk.UKey_GetCertInfoList.mockImplementationOnce(() => sdkFailure(0x0B000008))
    expect(() => selection.scan()).toThrow(String(0x0B000008))
    expect(sdk.UKey_GetCert).not.toHaveBeenCalled()
  })

  it('uses cached certificate data for details and does not read device certificate fields', () => {
    const { sdk } = mockDevice([A])
    const selection = new VCTKSCertificates(sdk)
    selection.select()
    for (let i = 0; i < 3; i++) FIELD_TYPES.forEach(type => selection.field(type))
    expect(selection.field(9)).toBe(A.CN)
    expect(selection.field(7)).toBe(A.issuer)
    expect(sdk.UKey_GetExtCertInfo).toHaveBeenCalledTimes(8)
    expect(sdk.UKey_GetExtCertInfo.mock.calls.every(args => args[1] === A.Cert)).toBe(true)
    expect(sdk.UKey_GetCertInfo).not.toHaveBeenCalled()
  })
})

function createPanel(sdk, { mode = 'admin', vendor = 'ji_da', provider = 'vctk_s' } = {}) {
  window.TestUKey = function() { return sdk }
  const Ctor = Vue.extend({
    ...Panel,
    mounted: undefined,
    computed: { ...Panel.computed, publicSettings: () => ({}) }
  })
  const panel = new Ctor({ propsData: { mode, object: { id: 'target', username: 'admin' } } })
  panel.$t = key => key
  panel.appendLog = jest.fn()
  panel.showInputDialog = jest.fn().mockResolvedValue({ pin: '123456' })
  panel.$confirm = jest.fn().mockResolvedValue()
  panel.$message = { warning: jest.fn(), error: jest.fn() }
  panel.config = {
    vendor, provider, revision: 'r1', certType: 1, digestAlg: 1, poll_interval: 5000,
    capabilities: { binding_mode: 'certificate' },
    api: { certificate_binding_url: '/binding/{user_id}/' },
    api_method: { certificate_binding_url: ['POST'] },
    api_body: { certificate_binding_url: ['action', 'cert', 'signature', 'hardware_serial', 'challenge_id'] }
  }
  panel.sdkConfig = {
    sdk: {
      create: { constructor: 'TestUKey' },
      setup: { steps: [
        { call: 'UKey_CheckInstall' },
        { call: 'UKey_GetDevSN', register: 'ukey.devSN' },
        { call: 'UKey_GetVersion', register: 'ukey.devVersion' }
      ] }
    },
    info: {
      when: true,
      device: [{
        key: 'ukeyConnected', label: 'connected', source: '{{ ukey.devSN }}', register: 'ukey.connected',
        status: { cases: [{ match: 'truthy', text: 'yes', value: true }, { match: 'falsy', text: 'no', value: false }] }
      }],
      cert: FIELD_TYPES.map(type => ({ key: 'field-' + type, label: String(type), call: 'UKey_GetCertInfo', args: [1, type] }))
    },
    operations: { when: true, items: [{
      key: 'bindUserUKeySN', label: 'bind', scope: 'admin', disabled: '{{ !ukey.connected }}',
      steps: [
        { call: 'UKey_VerifyPIN', args: ['{{ input.pin }}'], input: { fields: [{ key: 'pin' }] },
          check: { expr: '{{ result === 0 }}', message: 'bad PIN' } },
        { call: 'UKey_GetCert', args: [1], register: 'ukey.cert' },
        { type: 'api', method: 'post', url: '{{ config.api.certificate_binding_url }}',
          url_format: { user_id: '{{ user.id }}' }, body: { action: 'challenge' }, register: 'vars.challenge' },
        { call: 'UKey_P7SignAttach', args: [1, '{{ vars.challenge.code_base64 }}'], digest_certificate: '{{ ukey.cert }}',
          register: 'vars.signature' },
        { type: 'api', method: 'post', url: '{{ config.api.certificate_binding_url }}',
          url_format: { user_id: '{{ user.id }}' },
          body: { action: 'bind', cert: '{{ ukey.cert }}', signature: '{{ vars.signature }}',
            challenge_id: '{{ vars.challenge.id }}', hardware_serial: '{{ ukey.devSN }}' },
          register: 'ukey.binding' }
      ]
    }] }
  }
  panel.$axios = {
    get: jest.fn().mockResolvedValue({ vendor, provider, revision: 'r1' }),
    post: jest.fn().mockImplementation(async (url, body) => body.action === 'challenge'
      ? { id: 'challenge', code_base64: 'cmFuZG9t' }
      : { bound: true, hardware_serial: body.hardware_serial, binding_version: 'v1' })
  }
  window.VCTKSCertificateDigest = jest.fn(() => 1)
  return panel
}

describe('VCTK_S admin panel native certificate selection', () => {
  let panel
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => {
    if (panel) panel.$destroy()
    delete window.TestUKey
    delete window.VCTKSCertificateDigest
    jest.useRealTimers()
  })

  it('selects once before binding and keeps details without device-field reads on repeated polls', async () => {
    const { sdk, state } = mockDevice()
    panel = createPanel(sdk)
    await panel.initSDKInstance()
    expect(panel.hasCert).toBe(true)
    expect(panel.certInfoItems).toHaveLength(12)
    expect(panel.ukeySnapshot.cert).toBe(B.Cert)
    const reads = sdk.UKey_GetCert.mock.calls.length
    const fields = sdk.UKey_GetExtCertInfo.mock.calls.length
    for (let i = 0; i < 4; i++) await panel.pollStatus()
    expect(state.prompts).toBe(1)
    expect(sdk.UKey_GetCert).toHaveBeenCalledTimes(reads)
    expect(sdk.UKey_GetExtCertInfo).toHaveBeenCalledTimes(fields)
    expect(sdk.UKey_GetDevSN).toHaveBeenCalledTimes(1)
    expect(sdk.UKey_GetCertInfo).not.toHaveBeenCalled()
    expect(panel.$axios.post).not.toHaveBeenCalled()
  })

  it('does not repeat a cancelled chooser and allows explicit retry using the existing bind button', async () => {
    const { sdk, state } = mockDevice()
    state.cancelled = true
    panel = createPanel(sdk)
    await panel.initSDKInstance()
    for (let i = 0; i < 3; i++) await panel.pollStatus()
    expect(state.prompts).toBe(1)
    expect(panel.hasCert).toBe(false)
    expect(panel.certLoading).toBe(false)
    expect(panel.visibleOperations[0]._disabled).toBe(false)
    expect(sdk.UKey_GetExtCertInfo).not.toHaveBeenCalled()
    expect(sdk.UKey_GetDevSN).not.toHaveBeenCalled()
    state.cancelled = false
    await panel.handleOperation(panel.sdkConfig.operations.items[0])
    expect(state.prompts).toBe(2)
    expect(panel.$axios.post).toHaveBeenLastCalledWith('/binding/target/', expect.objectContaining({
      action: 'bind', cert: B.Cert, hardware_serial: 'serial-BB', signature: 'proof'
    }), undefined)
  })

  it('handles an empty key and removal without automatically reopening selection after reinsertion', async () => {
    const { sdk, state } = mockDevice([])
    panel = createPanel(sdk)
    await panel.initSDKInstance()
    expect(panel.hasCert).toBe(false)
    expect(sdk.UKey_GetCert).not.toHaveBeenCalled()
    state.certificates = [A, B]
    await panel.pollStatus()
    expect(state.prompts).toBe(0)
    expect(panel.visibleOperations[0]._disabled).toBe(false)
    await panel.handleOperation(panel.sdkConfig.operations.items[0])
    state.certificates = []
    await panel.pollStatus()
    expect(panel.hasCert).toBe(false)
    expect(panel.ukeySnapshot.cert).toBe('')
    expect(panel.ukeySnapshot.devSN).toBe('')
    state.certificates = [A, B]
    state.current = null
    await panel.pollStatus()
    expect(state.prompts).toBe(1)
    expect(panel.hasCert).toBe(false)
  })

  it('stops the entire detail read after cancellation rather than reading the remaining fields', async () => {
    const { sdk, state } = mockDevice([A])
    sdk.UKey_GetExtCertInfo.mockImplementation(() => sdkFailure(0x0B000011))
    panel = createPanel(sdk)
    await panel.initSDKInstance()
    expect(sdk.UKey_GetExtCertInfo).toHaveBeenCalledTimes(1)
    expect(panel.hasCert).toBe(false)
    await panel.pollStatus()
    await panel.readCertInfo()
    expect(sdk.UKey_GetExtCertInfo).toHaveBeenCalledTimes(1)
    expect(state.prompts).toBe(0)
  })

  it.each(['PIN input', 'challenge response'])('rejects a different current certificate after %s', async phase => {
    const { sdk, state } = mockDevice()
    panel = createPanel(sdk)
    await panel.initSDKInstance()
    if (phase === 'PIN input') {
      panel.showInputDialog.mockImplementation(async () => { state.current = A; return { pin: '123456' } })
    } else {
      panel.$axios.post.mockImplementation(async () => {
        state.current = A
        return { id: 'challenge', code_base64: 'cmFuZG9t' }
      })
    }
    await panel.handleOperation(panel.sdkConfig.operations.items[0])
    expect(sdk.UKey_P7SignAttach).not.toHaveBeenCalled()
    expect(panel.$axios.post.mock.calls.some(call => call[1].action === 'bind')).toBe(false)
    expect(panel.hasCert).toBe(false)
    expect(panel.running).toBe(false)
    expect(panel.appendLog).toHaveBeenCalledWith(expect.stringContaining('UKeyCertificateSelectionChanged'), 'error')
  })

  it('rejects a certificate changed during signing before submitting the binding', async () => {
    const { sdk, state } = mockDevice()
    panel = createPanel(sdk)
    await panel.initSDKInstance()
    sdk.UKey_P7SignAttach.mockImplementation(() => { state.current = A; return 'proof-from-another-key' })
    await panel.handleOperation(panel.sdkConfig.operations.items[0])
    expect(panel.$axios.post.mock.calls.some(call => call[1].action === 'bind')).toBe(false)
  })

  it.each(['recreate', 'destroy'])('stops a pending binding when the SDK owner changes: %s', async action => {
    const { sdk } = mockDevice([A])
    panel = createPanel(sdk)
    await panel.initSDKInstance()
    let finishInput
    let notifyInput
    const inputOpened = new Promise(resolve => { notifyInput = resolve })
    const input = new Promise(resolve => { finishInput = resolve })
    panel.showInputDialog.mockImplementation(() => { notifyInput(); return input })
    const binding = panel.handleOperation(panel.sdkConfig.operations.items[0])
    await inputOpened
    if (action === 'recreate') await panel.initSDKInstance()
    else panel.$destroy()
    finishInput({ pin: '123456' })
    await binding
    expect(sdk.UKey_VerifyPIN).not.toHaveBeenCalled()
    expect(sdk.UKey_P7SignAttach).not.toHaveBeenCalled()
    expect(panel.$axios.post).not.toHaveBeenCalled()
    expect(panel.running).toBe(false)
  })

  it('retains the PIN method arguments and can unbind without a key or certificate selection', async () => {
    const { sdk, state } = mockDevice([A])
    panel = createPanel(sdk)
    await panel.initSDKInstance()
    for (const [key, method, args] of [
      ['changePIN', 'UKey_ChangePIN', ['old-pin', 'new-pin']],
      ['resetPin', 'UKey_UnblockPIN', ['admin-pin', 'new-pin']]
    ]) {
      await panel.handleOperation({ key, steps: [{ call: method, args }] })
      expect(sdk[method]).toHaveBeenCalledWith(...args)
    }
    state.certificates = []
    await panel.pollStatus()
    sdk.UKey_GetCert.mockClear()
    sdk.UKey_SetCurCert.mockClear()
    await panel.handleOperation({ key: 'unbindUserUKeySN', requires_device: false, steps: [{
      type: 'api', method: 'post', url: '{{ config.api.certificate_binding_url }}',
      url_format: { user_id: '{{ user.id }}' }, body: { action: 'unbind' }, register: 'ukey.binding'
    }] })
    expect(panel.$axios.post).toHaveBeenLastCalledWith('/binding/target/', { action: 'unbind' }, undefined)
    expect(sdk.UKey_GetCert).not.toHaveBeenCalled()
    expect(sdk.UKey_SetCurCert).not.toHaveBeenCalled()
  })

  it.each([
    { mode: 'user', vendor: 'ji_da', provider: 'vctk_s' },
    { mode: 'admin', vendor: 'ji_da', provider: 'builtin' },
    { mode: 'admin', vendor: 'long_mai', provider: 'builtin' },
    { mode: 'admin', vendor: 'long_mai', provider: 'xjca' }
  ])('does not use the new selection flow for %p', async options => {
    const { sdk } = mockDevice([A])
    panel = createPanel(sdk, options)
    await panel.initSDKInstance()
    await panel.pollStatus()
    expect(sdk.UKey_GetCertInfoList).not.toHaveBeenCalled()
    expect(sdk.UKey_SetCurCert).not.toHaveBeenCalled()
    expect(sdk.UKey_GetDevSN).toHaveBeenCalledTimes(2)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(24)
  })

  it('clears selection when the SDK is recreated or the component is destroyed', async () => {
    const { sdk } = mockDevice([A])
    panel = createPanel(sdk)
    await panel.initSDKInstance()
    const previous = panel._vctksCertificates
    await panel.initSDKInstance()
    expect(previous.selected).toBeNull()
    const current = panel._vctksCertificates
    panel.$destroy()
    expect(current.selected).toBeNull()
    expect(panel._vctksCertificates).toBeNull()
    expect(jest.getTimerCount()).toBe(0)
    panel = null
  })
})
