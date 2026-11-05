import UKey from '@/views/settings/Auth/UKey.vue'

jest.mock('@/views/settings/Auth/Base', () => ({}))
jest.mock('@/components', () => ({ UploadKey: {} }))
jest.mock('@/components/Form/FormFields/TextReadonly.vue', () => ({}))
jest.mock('@/components/Form/DataForm/rules', () => ({ Required: { required: true } }))
jest.mock('@/utils/session-encrypt', () => ({ encryptPassword: value => `encrypted:${value}` }))

const providers = [
  {
    id: 'builtin', label: 'Builtin CA', fields: ['AUTH_UKEY_CA_CERT_CONTENT'],
    supported_vendors: ['ji_da', 'long_mai'], secret_fields: ['AUTH_UKEY_CA_CERT_CONTENT']
  },
  {
    id: 'xjca', label: 'Xinjiang CA', fields: ['AUTH_UKEY_XJCA_SVS_URL'],
    supported_vendors: ['long_mai'], supports_connection_test: true
  },
  {
    id: 'vctk_s', label: 'VCTK_S', supported_vendors: ['ji_da'],
    fields: ['AUTH_UKEY_VCTK_S_SVS_URL', 'AUTH_UKEY_VCTK_S_TLS_VERIFY', 'AUTH_UKEY_VCTK_S_TLS_CA_CERT',
      'AUTH_UKEY_VCTK_S_ISSUING_CA', 'AUTH_UKEY_VCTK_S_USERNAME', 'AUTH_UKEY_VCTK_S_PASSWORD'],
    secret_fields: ['AUTH_UKEY_VCTK_S_TLS_CA_CERT', 'AUTH_UKEY_VCTK_S_ISSUING_CA', 'AUTH_UKEY_VCTK_S_PASSWORD'],
    connection_fields: ['AUTH_UKEY_VCTK_S_SVS_URL', 'AUTH_UKEY_VCTK_S_TLS_VERIFY', 'AUTH_UKEY_VCTK_S_TLS_CA_CERT',
      'AUTH_UKEY_VCTK_S_USERNAME', 'AUTH_UKEY_VCTK_S_PASSWORD'],
    supports_connection_test: true, binding_mode: 'certificate', expose_default_pin: false, supports_enrollment: false
  }
]

function createVM() {
  const vm = { $t: key => key }
  for (const [key, method] of Object.entries(UKey.methods)) vm[key] = method.bind(vm)
  Object.assign(vm, UKey.data.call(vm))
  for (const [key, getter] of Object.entries(UKey.computed)) {
    Object.defineProperty(vm, key, { get: () => getter.call(vm) })
  }
  vm.captureSettings({
    AUTH_UKEY_CA_PROVIDERS: providers, AUTH_UKEY_CA_PROVIDER: 'vctk_s',
    AUTH_UKEY_VENDOR: 'ji_da', AUTH_UKEY_CONFIG_REVISION: 'revision-1'
  })
  return vm
}

describe('VCTK_S settings', () => {
  it('omits VCTK_S authorization when the backend does not provide VCTK_S', () => {
    const vm = createVM()
    vm.captureSettings({
      AUTH_UKEY_CA_PROVIDERS: providers.filter(provider => provider.id !== 'vctk_s'),
      AUTH_UKEY_CA_PROVIDER: 'builtin', AUTH_UKEY_VENDOR: 'ji_da'
    })
    expect(vm.settings.fields.some(([label]) => label === 'UKeyVCTKSAuthorizationAdvanced')).toBe(false)
    expect(vm.settings.fields.flatMap(([, fields]) => fields).some(field => field.startsWith('AUTH_UKEY_VCTK_S_'))).toBe(false)
  })

  it('omits authorization fields even when the backend still advertises them', () => {
    const vm = createVM()
    expect(vm.settings.fields.some(([label]) => label === 'UKeyVCTKSAuthorizationAdvanced')).toBe(false)
    const fields = vm.settings.fields.flatMap(([, fields]) => fields)
    expect(fields).not.toContain('AUTH_UKEY_VCTK_S_USERNAME')
    expect(fields).not.toContain('AUTH_UKEY_VCTK_S_PASSWORD')
    expect(vm.settings.fieldsMeta).not.toHaveProperty('AUTH_UKEY_VCTK_S_USERNAME')
    expect(vm.settings.fieldsMeta).not.toHaveProperty('AUTH_UKEY_VCTK_S_PASSWORD')
  })

  it('excludes authorization from saves to preserve saved credentials', () => {
    const vm = createVM()
    const clean = vm.cleanSettings({
      AUTH_UKEY_CA_PROVIDER: 'vctk_s', AUTH_UKEY_VENDOR: 'ji_da',
      AUTH_UKEY_VCTK_S_USERNAME: '', AUTH_UKEY_VCTK_S_PASSWORD: ''
    })
    expect(clean).not.toHaveProperty('AUTH_UKEY_VCTK_S_USERNAME')
    expect(clean).not.toHaveProperty('AUTH_UKEY_VCTK_S_PASSWORD')
  })

  it('excludes authorization from connection tests even if values are supplied', async () => {
    const vm = createVM()
    vm.$axios = { post: jest.fn().mockResolvedValue({ msg: 'Random generation checked' }) }
    vm.$message = { success: jest.fn() }
    await vm.testConnection({
      AUTH_UKEY_CA_PROVIDER: 'vctk_s', AUTH_UKEY_VENDOR: 'ji_da',
      AUTH_UKEY_VCTK_S_USERNAME: 'business', AUTH_UKEY_VCTK_S_PASSWORD: 'new-password'
    }, null, { loading: false })
    expect(vm.$axios.post.mock.calls[0][1]).not.toHaveProperty('AUTH_UKEY_VCTK_S_USERNAME')
    expect(vm.$axios.post.mock.calls[0][1]).not.toHaveProperty('AUTH_UKEY_VCTK_S_PASSWORD')
  })

  it('uses root CA and SSL labels for both vendors without changing provider values', () => {
    const vm = createVM()
    expect(vm.getProvider('builtin').label).toBe('UKeyBuiltinCARootCertificate')
    expect(vm.settings.fields.some(([label]) => label === 'UKeyBuiltinCARootCertificate')).toBe(true)
    expect(providers[0].label).toBe('Builtin CA')
    for (const prefix of ['AUTH_UKEY_VCTK_S', 'AUTH_UKEY_XJCA']) {
      expect(vm.settings.fieldsMeta[prefix + '_TLS_VERIFY'].options[0]).toEqual({
        value: 'custom', label: 'UKeyTLSCustomSSL'
      })
      expect(vm.settings.fieldsMeta[prefix + '_TLS_CA_CERT'].label).toBe('UKeySSLCertificate')
      expect(vm.settings.fieldsMeta[prefix + '_TLS_CA_CERT'].helpText).toBe('UKeySSLCertificateHelp')
    }
  })

  it('shows VCTK_S for JIT and keeps Xinjiang CA restricted to Longmai', () => {
    const vm = createVM()
    expect(vm.availableProviders.map(provider => provider.id)).toEqual(['builtin', 'vctk_s'])
    expect(vm.providerHelp).toBe('UKeyVCTKSHelp')
    vm.draftVendor = 'long_mai'
    expect(vm.availableProviders.map(provider => provider.id)).toEqual(['builtin', 'xjca'])
  })

  it('shows only service and TLS settings even with legacy issuing CA metadata', () => {
    const vm = createVM()
    const fields = vm.settings.fields.find(([label]) => label === 'VCTK_S')[1]
    expect(fields).toEqual([
      'AUTH_UKEY_VCTK_S_SVS_URL', 'AUTH_UKEY_VCTK_S_USE_SSL', 'AUTH_UKEY_VCTK_S_TLS_VERIFY',
      'AUTH_UKEY_VCTK_S_TLS_CA_CERT'
    ])
    expect(vm.settings.fieldsMeta).not.toHaveProperty('AUTH_UKEY_VCTK_S_ISSUING_CA')
    expect(vm.settings.fieldsMeta.AUTH_UKEY_XJCA_SVS_URL.hidden({})).toBe(true)
    expect(vm.formSettings.moreButtons).toHaveLength(1)
    expect(vm.formSettings.moreButtons[0]).not.toHaveProperty('hidden')
  })

  it('does not submit unknown values or settings belonging to another provider', () => {
    const vm = createVM()
    const clean = vm.cleanSettings({
      AUTH_UKEY: true, AUTH_UKEY_VENDOR: 'ji_da', AUTH_UKEY_CA_PROVIDER: 'vctk_s',
      AUTH_UKEY_VCTK_S_UNKNOWN: 'not an editable setting',
      AUTH_UKEY_VCTK_S_ISSUING_CA: 'legacy issuing CA',
      AUTH_UKEY_DEFAULT_PIN: 'saved administrative PIN',
      AUTH_UKEY_VCTK_S_SVS_URL: 'http://vctks.example.com:8000',
      AUTH_UKEY_XJCA_SVS_URL: 'http://another-provider'
    })
    expect(clean).toEqual({
      AUTH_UKEY: true, AUTH_UKEY_VENDOR: 'ji_da', AUTH_UKEY_CA_PROVIDER: 'vctk_s',
      AUTH_UKEY_VCTK_S_SVS_URL: 'http://vctks.example.com:8000',
      AUTH_UKEY_CONFIG_REVISION: 'revision-1'
    })
  })

  it('excludes UI state, read-only CA status and empty certificate uploads', () => {
    const vm = createVM()
    const clean = vm.cleanSettings({
      AUTH_UKEY: true, AUTH_UKEY_VENDOR: 'ji_da', AUTH_UKEY_CA_PROVIDER: 'vctk_s',
      AUTH_UKEY_VCTK_S_USE_SSL: true, AUTH_UKEY_VCTK_S_ISSUING_CA_CONFIGURED: false,
      AUTH_UKEY_VCTK_S_ISSUING_CA: '', AUTH_UKEY_VCTK_S_TLS_CA_CERT: ''
    })
    expect(Object.keys(clean).sort()).toEqual([
      'AUTH_UKEY', 'AUTH_UKEY_CA_PROVIDER', 'AUTH_UKEY_CONFIG_REVISION', 'AUTH_UKEY_VENDOR'
    ])
  })

  it('shows VCTK_S TLS fields according to its SSL switch and trust mode', () => {
    const vm = createVM()
    const fields = vm.settings.fieldsMeta
    const form = { AUTH_UKEY_VCTK_S_USE_SSL: true, AUTH_UKEY_VCTK_S_TLS_VERIFY: 'insecure' }
    expect(fields.AUTH_UKEY_VCTK_S_TLS_VERIFY.hidden(form)).toBe(false)
    expect(fields.AUTH_UKEY_VCTK_S_TLS_CA_CERT.hidden(form)).toBe(true)
    form.AUTH_UKEY_VCTK_S_TLS_VERIFY = 'custom'
    expect(fields.AUTH_UKEY_VCTK_S_TLS_CA_CERT.hidden(form)).toBe(false)
    form.AUTH_UKEY_VCTK_S_USE_SSL = false
    expect(fields.AUTH_UKEY_VCTK_S_TLS_VERIFY.hidden(form)).toBe(true)
    expect(fields.AUTH_UKEY_VCTK_S_TLS_CA_CERT.hidden(form)).toBe(true)
  })

  it('tests only connection fields, preserves saved secrets and displays the scoped result', async () => {
    const vm = createVM()
    vm.$axios = { post: jest.fn().mockResolvedValue({ msg: 'Random generation only; verification not tested.' }) }
    vm.$message = { success: jest.fn() }
    const button = { loading: false }
    await vm.testConnection({
      AUTH_UKEY_CA_PROVIDER: 'vctk_s', AUTH_UKEY_VENDOR: 'ji_da',
      AUTH_UKEY_VCTK_S_SVS_URL: 'http://vctks.example.com', AUTH_UKEY_VCTK_S_TLS_CA_CERT: '',
      AUTH_UKEY_VCTK_S_ISSUING_CA: 'not a connection parameter',
      AUTH_UKEY_VCTK_S_UNKNOWN: 'not a connection parameter'
    }, null, button)
    const draft = vm.$axios.post.mock.calls[0][1]
    expect(draft).not.toHaveProperty('AUTH_UKEY_VCTK_S_ISSUING_CA')
    expect(draft).not.toHaveProperty('AUTH_UKEY_VCTK_S_TLS_CA_CERT')
    expect(draft).not.toHaveProperty('AUTH_UKEY_VCTK_S_UNKNOWN')
    expect(vm.$message.success).toHaveBeenCalledWith('Random generation only; verification not tested.')
    expect(button.loading).toBe(false)
  })

  it.each([
    [new Error('timeout'), 'timeout'],
    [{ response: { data: { AUTH_UKEY_VCTK_S_SVS_URL: ['Invalid service URL'] } } },
      'AUTH_UKEY_VCTK_S_SVS_URL: Invalid service URL'],
    [{ response: { data: { detail: 'Too many requests' } } }, 'Too many requests'],
    [{}, 'TestFailed']
  ])('reports a failed connection once and allows retry', async (error, message) => {
    const vm = createVM()
    vm.$axios = { post: jest.fn().mockRejectedValueOnce(error).mockResolvedValueOnce({ msg: 'passed' }) }
    vm.$message = { error: jest.fn(), success: jest.fn() }
    const button = { loading: false }
    const value = {
      AUTH_UKEY_CA_PROVIDER: 'vctk_s', AUTH_UKEY_VENDOR: 'ji_da'
    }
    await vm.testConnection(value, null, button)
    expect(vm.$message.error).toHaveBeenCalledTimes(1)
    expect(vm.$message.error).toHaveBeenCalledWith(message)
    expect(vm.$message.success).not.toHaveBeenCalled()
    expect(vm.$axios.post.mock.calls[0][2]).toEqual({ disableFlashErrorMsg: true })
    expect(button.loading).toBe(false)
    await vm.testConnection(value, null, button)
    expect(vm.$message.success).toHaveBeenCalledWith('passed')
    expect(button.loading).toBe(false)
  })

  it('omits blank credentials without changing the draft or validating save-only fields', async () => {
    const vm = createVM()
    vm.$axios = { post: jest.fn().mockResolvedValue({ msg: 'passed' }) }
    vm.$message = { success: jest.fn() }
    const value = {
      AUTH_UKEY_CA_PROVIDER: 'vctk_s', AUTH_UKEY_VENDOR: 'ji_da',
      AUTH_UKEY_VCTK_S_USERNAME: '', AUTH_UKEY_VCTK_S_PASSWORD: '',
      AUTH_UKEY_VCTK_S_TLS_CA_CERT: '', AUTH_UKEY_VCTK_S_ISSUING_CA: '',
      AUTH_UKEY_DEFAULT_PIN: 'not-a-connection-field'
    }
    const original = { ...value }
    const form = { validate: jest.fn() }
    await vm.testConnection(value, form, { loading: false })
    const draft = vm.$axios.post.mock.calls[0][1]
    expect(draft).not.toHaveProperty('AUTH_UKEY_VCTK_S_USERNAME')
    for (const key of ['AUTH_UKEY_VCTK_S_PASSWORD', 'AUTH_UKEY_VCTK_S_TLS_CA_CERT',
      'AUTH_UKEY_VCTK_S_ISSUING_CA', 'AUTH_UKEY_DEFAULT_PIN']) {
      expect(draft).not.toHaveProperty(key)
    }
    expect(value).toEqual(original)
    expect(form.validate).not.toHaveBeenCalled()
  })

  it('returns to builtin when switching to a vendor without VCTK_S support', () => {
    const vm = createVM()
    const updateForm = jest.fn()
    vm.changeVendor('long_mai', updateForm)
    expect(vm.draftProvider).toBe('builtin')
    expect(updateForm).toHaveBeenCalledWith({ AUTH_UKEY_CA_PROVIDER: 'builtin' })
    expect(vm.formSettings.moreButtons).toEqual([])
  })

  it('rejects an incompatible vendor before saving or testing its service', async () => {
    const vm = createVM()
    vm.$message = { warning: jest.fn() }
    vm.$axios = { post: jest.fn() }
    const submit = { isSubmitting: false, defaultOnSubmit: jest.fn() }
    const values = { AUTH_UKEY_CA_PROVIDER: 'vctk_s', AUTH_UKEY_VENDOR: 'long_mai' }
    vm.settings.onSubmit.call(submit, values)
    await vm.testConnection(values, null, { loading: false })
    expect(submit.defaultOnSubmit).not.toHaveBeenCalled()
    expect(vm.$axios.post).not.toHaveBeenCalled()
    expect(vm.$message.warning).toHaveBeenCalledTimes(2)
  })
})
