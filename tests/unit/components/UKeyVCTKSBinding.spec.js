import Panel from '@/components/Apps/UKeyPanel/index.vue'

jest.mock('@/layout/components/Page/TwoColPage.vue', () => ({}))
jest.mock('@/components/Common/IBox', () => ({}))

function createVM(mode = 'admin') {
  const vm = { $t: key => key, mode, object: { id: 'account-id' }, publicSettings: {} }
  Object.assign(vm, Panel.data.call(vm))
  for (const [key, method] of Object.entries(Panel.methods)) vm[key] = method.bind(vm)
  for (const [key, getter] of Object.entries(Panel.computed)) {
    if (key !== 'publicSettings') Object.defineProperty(vm, key, { get: () => getter.call(vm) })
  }
  vm.appendLog = jest.fn()
  vm.readDeviceInfo = jest.fn()
  vm.readCertInfo = jest.fn()
  vm.config = { provider: 'vctk_s', capabilities: { binding_mode: 'certificate' } }
  vm.sdkConfig = { sdk: { create: { constructor: 'TestUKey' } } }
  vm.$axios = { get: jest.fn().mockResolvedValue({ bound: true }) }
  return vm
}

describe('VCTK_S certificate binding panel', () => {
  let vm
  let sign
  beforeEach(async () => {
    jest.useFakeTimers()
    sign = jest.fn().mockReturnValue('attached-proof')
    window.TestUKey = function() { this.UKey_P7SignAttach = sign }
    vm = createVM()
    await vm.initSDKInstance()
  })
  afterEach(() => {
    clearInterval(vm.pollTimer)
    delete window.TestUKey
    delete window.VCTKSCertificateDigest
    jest.useRealTimers()
  })

  const step = {
    call: 'UKey_P7SignAttach', digest_certificate: '{{ ukey.cert }}',
    args: [99, '{{ vars.challenge.code_base64 }}']
  }
  const ctx = { ukey: { cert: 'selected-cert' }, vars: { challenge: { code_base64: 'challenge-base64' } } }

  it.each([1, 4])('selects digest %s from the actual certificate before signing', digest => {
    window.VCTKSCertificateDigest = jest.fn().mockReturnValue(digest)
    expect(vm.callUKeyMethod(step, ctx)).toBe('attached-proof')
    expect(window.VCTKSCertificateDigest).toHaveBeenCalledWith('selected-cert')
    expect(sign).toHaveBeenCalledWith(digest, 'challenge-base64')
  })

  it('does not sign if the helper is missing, throws, or returns an unsupported digest', () => {
    for (const helper of [undefined, () => { throw new Error('bad certificate') }, () => 99]) {
      window.VCTKSCertificateDigest = helper
      expect(() => vm.callUKeyMethod(step, ctx)).toThrow()
    }
    expect(sign).not.toHaveBeenCalled()
  })

  it.each(['builtin', 'xjca'])('keeps %s SDK arguments unchanged', provider => {
    vm.config.provider = provider
    window.VCTKSCertificateDigest = jest.fn()
    vm.callUKeyMethod(step, ctx)
    expect(sign).toHaveBeenCalledWith(99, 'challenge-base64')
    expect(window.VCTKSCertificateDigest).not.toHaveBeenCalled()
  })

  it('reads the target user binding through the existing admin endpoint', async () => {
    vm.config.api = { certificate_binding_url: '/binding/{user_id}/' }
    await vm.readBinding(vm.config)
    expect(vm.$axios.get).toHaveBeenCalledWith('/binding/account-id/')
  })

  it('allows self PIN controls using only the authenticated user binding', async () => {
    vm.mode = 'user'
    vm.config.own_binding = { user_id: 'account-id', bound: true, hardware_serial: 'serial' }
    expect(await vm.readBinding(vm.config)).toBe(vm.config.own_binding)
    expect(vm.$axios.get).not.toHaveBeenCalled()
    vm.object.id = 'another-user'
    expect((await vm.readBinding(vm.config)).bound).toBe(false)
    expect(vm.$axios.get).not.toHaveBeenCalled()
  })

  it('retains the original self status behavior for other providers', async () => {
    vm.mode = 'user'
    vm.config.provider = 'xjca'
    vm.config.own_binding = { user_id: 'account-id', bound: true }
    expect((await vm.readBinding(vm.config)).bound).toBe(false)
  })
})
