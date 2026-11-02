import Panel from '@/components/Apps/UKeyPanel/index.vue'

const SM2_DETAILS = {
  Version: 'V3',
  SN: '645552B60751FFF2',
  StartTime: '2026-10-30 10:57:25',
  EndTime: '2029-10-29 10:57:25',
  PublicKey: 'BEvza/IYLPgxxsJb7TkCRtnpm6seuZeMFk9hApGndh8QNTlpFmNF9FN5A4jlTEM0+R3xN/IGDILPqSffh4z7C6E=',
  IssuerCN: 'ShanXi Digital Certificate Authority',
  IssuerO: 'ShanXi Digital Certificate Authority',
  IssuerOU: '',
  IssuerC: 'CN',
  IssuerL: 'TaiYuan',
  IssuerST: 'ShanXi',
  SubjectCN: 'sangfor_osm',
  SubjectO: '',
  SubjectOU: '\u6df1\u4fe1\u670d',
  SubjectC: 'CN',
  SubjectL: '',
  SubjectST: '',
  CertAlgType: 2,
  CertUsage: 1
}
const SM2_RESULT = JSON.stringify(SM2_DETAILS)
const RSA_RESULT = JSON.stringify({
  ...SM2_DETAILS, Version: 'V1', SN: '123456789ABCDEF0',
  SubjectCN: 'rsa-user', PublicKey: 'rsa-public-key', CertAlgType: 1
})

jest.mock('@/layout/components/Page/TwoColPage.vue', () => ({}))
jest.mock('@/components/Common/IBox', () => ({}))

const CERT_FIELDS = [
  ['CERT_SUBJECT_CN', 9],
  ['CERT_SUBJECT_O', 10],
  ['CERT_SUBJECT_OU', 11],
  ['CERT_VERSION', 1],
  ['CERT_SERIAL', 2],
  ['CERT_START_TIME', 3],
  ['CERT_END_TIME', 4],
  ['CERT_DER_PUBLIC_KEY', 5],
  ['CERT_ISSUER_CN', 6],
  ['CERT_ISSUER_O', 7],
  ['CERT_ISSUER_OU', 8],
  ['CERT_ALG_TYPE', 13]
]

function createVM(config = {}, mode = 'admin') {
  const vm = {
    $t: key => key, mode,
    object: { id: 'managed-account', username: 'managed-user' },
    publicSettings: {}
  }
  Object.assign(vm, Panel.data.call(vm))
  for (const [key, method] of Object.entries(Panel.methods)) vm[key] = method.bind(vm)
  for (const [key, getter] of Object.entries(Panel.computed)) {
    if (key !== 'publicSettings') Object.defineProperty(vm, key, { get: () => getter.call(vm) })
  }
  vm.appendLog = jest.fn()
  vm.checkConfigRevision = jest.fn().mockResolvedValue(true)
  vm.config = { vendor: 'ji_da', provider: 'vctk_s', certType: 1, ...config }
  vm.sdkConfig = {
    sdk: { create: { constructor: 'SingleReadTestUKey' } },
    info: {
      device: [],
      cert: CERT_FIELDS.map(([key, id]) => ({
        key, label: key, call: 'UKey_GetCertInfo',
        args: ['{{ config.certType }}', id]
      }))
    }
  }
  return vm
}

function values(vm) {
  return Object.fromEntries(vm.certInfoItems.map(item => [item.key, item.value]))
}

describe('VCTK_S fresh SDK all-field reads', () => {
  let vm
  let sdk
  let calls

  beforeEach(() => {
    jest.useFakeTimers()
    calls = []
    sdk = {
      UKey_GetCert: jest.fn(() => 'operation-certificate'),
      UKey_GetCertInfo: jest.fn((certType, id) => {
        if (id !== 14) return `native-field-${id}`
        calls.push('certificate')
        return SM2_RESULT
      }),
      UKey_GetCertInfoList: jest.fn(),
      UKey_GetExtCertInfo: jest.fn(),
      UKey_SetCurCert: jest.fn(),
      UKey_CheckInstall: jest.fn(() => { calls.push('install'); return 0 }),
      UKey_GetDevSN: jest.fn(() => { calls.push('serial'); return 'same-device' }),
      UKey_GetVersion: jest.fn(() => { calls.push('version'); return '1.0' }),
      UKey_HasCert: jest.fn(() => true),
      UKey_CustomInfo: jest.fn(() => 'custom SDK field')
    }
    window.SingleReadTestUKey = jest.fn(function() { Object.assign(this, sdk) })
    vm = createVM()
  })

  afterEach(() => {
    if (vm) Panel.beforeDestroy.call(vm)
    delete window.SingleReadTestUKey
    jest.useRealTimers()
  })

  function expectNoSelectionOrPerFieldCalls() {
    for (const method of ['UKey_GetCert', 'UKey_GetCertInfoList', 'UKey_GetExtCertInfo', 'UKey_SetCurCert']) {
      expect(sdk[method]).not.toHaveBeenCalled()
    }
    expect(sdk.UKey_GetCertInfo.mock.calls.every(([, id]) => id === 14)).toBe(true)
  }

  it('renders all twelve configured rows from one SDK all-field read', async () => {
    await vm.initSDKInstance()
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledWith(1, 14)
    expect(vm.hasCert).toBe(true)
    expect(vm.certLoading).toBe(false)
    expect(vm.certInfoItems.map(item => item.key)).toEqual(CERT_FIELDS.map(([key]) => key))
    expect(values(vm)).toEqual({
      CERT_SUBJECT_CN: 'sangfor_osm',
      CERT_SUBJECT_O: '',
      CERT_SUBJECT_OU: '\u6df1\u4fe1\u670d',
      CERT_SERIAL: '645552B60751FFF2',
      CERT_VERSION: 'V3',
      CERT_START_TIME: '2026-10-30 10:57:25',
      CERT_END_TIME: '2029-10-29 10:57:25',
      CERT_DER_PUBLIC_KEY: SM2_DETAILS.PublicKey,
      CERT_ISSUER_CN: SM2_DETAILS.IssuerCN,
      CERT_ISSUER_O: SM2_DETAILS.IssuerO,
      CERT_ISSUER_OU: '',
      CERT_ALG_TYPE: '2'
    })
    expectNoSelectionOrPerFieldCalls()
  })

  it('keeps missing or invalid field values empty without substituting stale values', async () => {
    await vm.initSDKInstance()
    sdk.UKey_GetCertInfo.mockReturnValueOnce(JSON.stringify({
      Version: 'V3', SubjectCN: 'another-user', SubjectOU: null,
      SubjectO: {}, IssuerCN: [], IssuerO: false
    }))
    await vm.readCertInfo()
    expect(values(vm)).toMatchObject({
      CERT_SUBJECT_CN: 'another-user', CERT_VERSION: 'V3',
      CERT_SUBJECT_O: '-', CERT_SUBJECT_OU: '-',
      CERT_ISSUER_CN: '-', CERT_ISSUER_O: '-', CERT_SERIAL: '-'
    })
    expect(sdk.UKey_GetCertInfo.mock.calls).toEqual([[1, 14], [1, 14]])
    expectNoSelectionOrPerFieldCalls()
  })

  it('does not display inherited properties as certificate fields', async () => {
    vm.sdkConfig.info.cert[0].args[1] = 'toString'
    await vm.initSDKInstance()
    expect(vm.certInfoItems[0].value).toBe('-')
    expectNoSelectionOrPerFieldCalls()
  })

  it('reads again every cycle and immediately displays a changed certificate on the same device', async () => {
    sdk.UKey_GetCertInfo.mockReturnValueOnce(SM2_RESULT).mockReturnValueOnce(RSA_RESULT).mockReturnValueOnce(SM2_RESULT)
    await vm.initSDKInstance()
    const first = values(vm)
    await vm.pollStatus()
    const second = values(vm)
    expect(second).toMatchObject({
      CERT_SUBJECT_CN: 'rsa-user',
      CERT_SERIAL: '123456789ABCDEF0',
      CERT_VERSION: 'V1',
      CERT_ALG_TYPE: '1'
    })
    expect(second.CERT_SUBJECT_CN).not.toEqual(first.CERT_SUBJECT_CN)
    expect(second.CERT_SERIAL).not.toEqual(first.CERT_SERIAL)
    expect(second.CERT_DER_PUBLIC_KEY).not.toEqual(first.CERT_DER_PUBLIC_KEY)
    await vm.pollStatus()
    expect(values(vm)).toEqual(first)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(3)
    expectNoSelectionOrPerFieldCalls()
  })

  it('still performs a native read when the certificate has not changed', async () => {
    await vm.initSDKInstance()
    const first = values(vm)
    await vm.readCertInfo()
    await vm.readCertInfo()
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(3)
    expect(values(vm)).toEqual(first)
    expectNoSelectionOrPerFieldCalls()
  })

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['empty result', ''],
    ['malformed JSON', 'not-json'],
    ['JSON null', 'null'],
    ['array', '[]'],
    ['number', '1'],
    ['boolean', 'false'],
    ['JSON string', '"certificate"'],
    ['empty object', '{}'],
    ['unrecognized fields', '{"CN":"not-a-valid-result"}']
  ])('clears stale details after %s and reads again on the following cycle', async (_label, result) => {
    await vm.initSDKInstance()
    sdk.UKey_GetCertInfo.mockReturnValueOnce(result)
    await vm.readCertInfo()
    expect(vm.hasCert).toBe(false)
    expect(vm.certLoading).toBe(false)
    expect(vm.certInfoItems.every(item => item.value === '-')).toBe(true)
    await vm.readCertInfo()
    expect(vm.hasCert).toBe(true)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(3)
    expectNoSelectionOrPerFieldCalls()
  })

  it('does not reuse the previous certificate after SDK cancellation or disable later retries', async () => {
    await vm.initSDKInstance()
    sdk.UKey_GetCertInfo.mockImplementationOnce(() => { throw new Error('certificate selection canceled') })
    await vm.readCertInfo()
    expect(vm.hasCert).toBe(false)
    expect(vm.certInfoItems.every(item => item.value === '-')).toBe(true)
    await vm.readCertInfo()
    expect(vm.hasCert).toBe(true)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(3)
    expectNoSelectionOrPerFieldCalls()
  })

  it('passes the current configured certificate type on every read', async () => {
    vm.config.certType = 0
    await vm.initSDKInstance()
    vm.config.certType = 1
    await vm.readCertInfo()
    expect(sdk.UKey_GetCertInfo.mock.calls).toEqual([[0, 14], [1, 14]])
  })

  it('preserves field comparison against the managed user', async () => {
    vm.sdkConfig.info.cert[0].compare = '{{ user.username }}'
    await vm.initSDKInstance()
    const cn = values(vm).CERT_SUBJECT_CN
    expect(vm.certInfoItems[0].tag).toBe('danger')
    vm.object.username = cn
    await vm.readCertInfo()
    expect(vm.certInfoItems[0].tag).toBe('success')
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(2)
  })

  it('applies field checks to SDK values and preserves call-over-value priority', async () => {
    const subjectField = vm.sdkConfig.info.cert[0]
    subjectField.check = { expr: '{{ result === user.username }}' }
    subjectField.value = 'must not override the certificate'
    await vm.initSDKInstance()
    expect(vm.certInfoItems[0].value).toBe('-')
    delete subjectField.check
    await vm.readCertInfo()
    const cn = values(vm).CERT_SUBJECT_CN
    expect(cn).not.toBe(subjectField.value)
    vm.object.username = cn
    subjectField.check = '{{ result === user.username }}'
    await vm.readCertInfo()
    expect(vm.certInfoItems[0].value).toBe(cn)
    expectNoSelectionOrPerFieldCalls()
  })

  it('preserves value-only rows and non-certificate SDK fields', async () => {
    vm.sdkConfig.info.cert.push(
      { key: 'managed_user', label: 'managed_user', value: '{{ user.username }}' },
      { key: 'sdk_custom', label: 'sdk_custom', call: 'UKey_CustomInfo', args: [] }
    )
    await vm.initSDKInstance()
    expect(values(vm).managed_user).toBe('managed-user')
    expect(values(vm).sdk_custom).toBe('custom SDK field')
    expect(sdk.UKey_CustomInfo).toHaveBeenCalledTimes(1)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
    expectNoSelectionOrPerFieldCalls()
  })

  it('resolves the configured information type expression before reading a batched field', async () => {
    await vm.initSDKInstance()
    const cn = values(vm).CERT_SUBJECT_CN
    vm.config.subjectInfoType = 9
    vm.sdkConfig.info.cert[0].args[1] = '{{ config.subjectInfoType }}'
    await vm.readCertInfo()
    expect(values(vm).CERT_SUBJECT_CN).toBe(cn)
    expectNoSelectionOrPerFieldCalls()
  })

  it('honors the existing information gate without fetching or retaining stale details', async () => {
    await vm.initSDKInstance()
    vm.sdkConfig.info.when = false
    await vm.readCertInfo()
    expect(vm.certInfoItems).toEqual([])
    expect(vm.hasCert).toBe(false)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
    vm.sdkConfig.info.when = true
    await vm.readCertInfo()
    expect(vm.hasCert).toBe(true)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(2)
  })

  it('honors object-form certificate conditions before reading the certificate', async () => {
    const fields = vm.sdkConfig.info.cert
    vm.sdkConfig.info.cert = { when: '{{ user.allowCertificate }}', fields }
    vm.object.allowCertificate = false
    await vm.initSDKInstance()
    expect(sdk.UKey_GetCertInfo).not.toHaveBeenCalled()
    expect(vm.hasCert).toBe(false)
    vm.object.allowCertificate = true
    await vm.readCertInfo()
    expect(vm.hasCert).toBe(true)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
  })

  it('retains SDK certificate-check semantics while collecting display fields in one read', async () => {
    const fields = vm.sdkConfig.info.cert
    vm.sdkConfig.info.cert = {
      when: { call: 'UKey_HasCert', args: [], expr: '{{ result === true }}' }, fields
    }
    sdk.UKey_HasCert.mockReturnValueOnce(false)
    await vm.initSDKInstance()
    expect(sdk.UKey_GetCertInfo).not.toHaveBeenCalled()
    await vm.readCertInfo()
    expect(sdk.UKey_HasCert).toHaveBeenCalledTimes(2)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
    expect(vm.hasCert).toBe(true)
  })

  it('does not read a certificate when no certificate fields are configured', async () => {
    vm.sdkConfig.info.cert = []
    await vm.initSDKInstance()
    expect(vm.certInfoItems).toEqual([])
    expect(vm.hasCert).toBe(false)
    expect(sdk.UKey_GetCertInfo).not.toHaveBeenCalled()
  })

  it.each([
    ['admin', 'ji_da', 'builtin'],
    ['admin', 'long_mai', 'builtin'],
    ['admin', 'long_mai', 'xjca'],
    ['user', 'ji_da', 'vctk_s']
  ])('keeps original per-field reads for %s / %s / %s', async (mode, vendor, provider) => {
    vm = createVM({ vendor, provider }, mode)
    await vm.initSDKInstance()
    expect(sdk.UKey_GetCert).not.toHaveBeenCalled()
    expect(sdk.UKey_GetCertInfo.mock.calls).toEqual(CERT_FIELDS.map(([, id]) => [1, id]))
    expect(vm.hasCert).toBe(true)
    expect(values(vm).CERT_SUBJECT_CN).toBe('native-field-9')
    expect(sdk.UKey_GetCertInfoList).not.toHaveBeenCalled()
    expect(sdk.UKey_SetCurCert).not.toHaveBeenCalled()
  })

  it('preserves setup calls and fresh detail collection on each five-second poll', async () => {
    vm.sdkConfig.sdk.setup = {
      steps: [
        { call: 'UKey_CheckInstall', args: [] },
        { call: 'UKey_GetDevSN', args: [], register: 'ukey.devSN' },
        { call: 'UKey_GetVersion', args: [], register: 'ukey.devVersion' }
      ]
    }
    await vm.initSDKInstance()
    expect(calls).toEqual(['install', 'serial', 'version', 'certificate'])
    expect(vm.ukeySnapshot).toMatchObject({ devSN: 'same-device', devVersion: '1.0' })
    await jest.advanceTimersByTimeAsync(4999)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
    await jest.advanceTimersByTimeAsync(1)
    expect(calls).toEqual([
      'install', 'serial', 'version', 'certificate',
      'install', 'serial', 'version', 'certificate'
    ])
    expectNoSelectionOrPerFieldCalls()
  })

  it('keeps polling paused while an operation runs and resumes afterward', async () => {
    await vm.initSDKInstance()
    vm.running = true
    await jest.advanceTimersByTimeAsync(5000)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
    vm.running = false
    await jest.advanceTimersByTimeAsync(5000)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(2)
    expect(vm.polling).toBe(false)
  })

  it('calls the SDK afresh when a new user UKey page is entered', async () => {
    sdk.UKey_GetCertInfo.mockReturnValueOnce(SM2_RESULT).mockReturnValueOnce(RSA_RESULT)
    await vm.initSDKInstance()
    const firstCN = values(vm).CERT_SUBJECT_CN
    Panel.beforeDestroy.call(vm)
    await jest.advanceTimersByTimeAsync(5000)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
    vm = createVM()
    vm.object.id = 'another-managed-account'
    await vm.initSDKInstance()
    expect(window.SingleReadTestUKey).toHaveBeenCalledTimes(2)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(2)
    expect(values(vm).CERT_SUBJECT_CN).not.toBe(firstCN)
    expectNoSelectionOrPerFieldCalls()
  })

  it('keeps later operation certificate reads separate from display details', async () => {
    await vm.initSDKInstance()
    const result = vm.callUKeyMethod(
      { call: 'UKey_GetCert', args: ['{{ config.certType }}'] },
      vm.buildContext({ vars: {}, input: {} })
    )
    expect(result).toBe('operation-certificate')
    expect(sdk.UKey_GetCert).toHaveBeenCalledTimes(1)
    expect(sdk.UKey_GetCert).toHaveBeenCalledWith(1)
    expect(sdk.UKey_GetCertInfo.mock.calls).toEqual([[1, 14]])
    expect(sdk.UKey_SetCurCert).not.toHaveBeenCalled()
  })
})
