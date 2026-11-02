import Vue from 'vue'
import { createLocalVue, mount } from '@vue/test-utils'
import ElementUI from 'element-ui'
import _ from 'lodash'
import UKey from '@/views/settings/Auth/UKey.vue'

jest.mock('lodash-es', () => jest.requireActual('lodash'))
jest.mock('@/layout/components', () => ({
  GenericCreateUpdateForm: jest.requireActual('@/layout/components/GenericCreateUpdateForm/index.vue').default
}))
jest.mock('@/components', () => ({
  UploadKey: {
    props: ['value'],
    template: '<textarea :value="value" @input="$emit(\'input\', $event.target.value)" />'
  }
}))
jest.mock('@/components/Form/FormFields/NestedObjectSelect2.vue', () => ({}))
jest.mock('@/components/Form/AutoDataForm/components/NestedField.vue', () => ({}))
jest.mock('@/components/Form/FormFields/BasicTree.vue', () => ({}))
jest.mock('@/components/Form/FormFields/JsonEditor.vue', () => ({}))
jest.mock('@/components/Form/FormFields/TagInput.vue', () => ({}))
jest.mock('@/utils/session-encrypt', () => ({ encryptPassword: value => value }))
jest.mock('@/utils/request', () => ({ get: jest.fn() }))
jest.mock('@/i18n/i18n', () => ({ t: key => key }))
jest.mock('@/utils/vue/message', () => ({ message: {} }))
jest.mock('@/utils/storage', () => ({
  vueCookie: { get: () => 'en' }, getBasePath: () => '/', scopedLocalStorage: {}
}))

const SERVER_URL = 'AUTH_UKEY_VCTK_S_SVS_URL'
const SSL = 'AUTH_UKEY_VCTK_S_USE_SSL'
const TLS_VERIFY = 'AUTH_UKEY_VCTK_S_TLS_VERIFY'
const TLS_CA = 'AUTH_UKEY_VCTK_S_TLS_CA_CERT'
const ISSUING_CA = 'AUTH_UKEY_VCTK_S_ISSUING_CA'
const CA_CONFIGURED = 'AUTH_UKEY_VCTK_S_ISSUING_CA_CONFIGURED'
const AUTH_USER = 'AUTH_UKEY_VCTK_S_USERNAME'
const AUTH_PASSWORD = 'AUTH_UKEY_VCTK_S_PASSWORD'
const testLabels = { UKeyTestConnection: 'Test', UKeyTestFishermanConnection: 'Test' }
const fields = [SERVER_URL, TLS_VERIFY, TLS_CA, ISSUING_CA, AUTH_USER, AUTH_PASSWORD]
const writeOnlyFields = [TLS_CA, ISSUING_CA, AUTH_PASSWORD, 'AUTH_UKEY_DEFAULT_PIN', 'AUTH_UKEY_CA_CERT_CONTENT', 'AUTH_UKEY_XJCA_TLS_CA_CERT']
const providers = [
  {
    id: 'builtin', label: 'Builtin CA', supported_vendors: ['ji_da', 'long_mai'],
    fields: ['AUTH_UKEY_ENROLL_ENABLED', 'AUTH_UKEY_CA_CERT_CONTENT'],
    secret_fields: ['AUTH_UKEY_CA_CERT_CONTENT'], supports_enrollment: true
  },
  {
    id: 'xjca', label: 'Xinjiang CA', supported_vendors: ['long_mai'],
    fields: ['AUTH_UKEY_XJCA_SVS_URL', 'AUTH_UKEY_XJCA_TLS_VERIFY', 'AUTH_UKEY_XJCA_TLS_CA_CERT'],
    connection_fields: ['AUTH_UKEY_XJCA_SVS_URL', 'AUTH_UKEY_XJCA_TLS_VERIFY', 'AUTH_UKEY_XJCA_TLS_CA_CERT'],
    secret_fields: ['AUTH_UKEY_XJCA_TLS_CA_CERT'], supports_connection_test: true
  },
  {
    id: 'vctk_s', label: 'VCTK_S', supported_vendors: ['ji_da'], fields,
    secret_fields: [ISSUING_CA, TLS_CA, AUTH_PASSWORD],
    connection_fields: [SERVER_URL, TLS_VERIFY, TLS_CA, AUTH_USER, AUTH_PASSWORD],
    supports_connection_test: true, binding_mode: 'certificate', expose_default_pin: true, supports_enrollment: false
  }
]
const stringField = { type: 'string', max_length: 65536, required: false }
const trustChoices = ['system', 'custom', 'insecure'].map(value => ({ value, label: value }))
const remoteMeta = {
  ...Object.fromEntries(providers.flatMap(provider => provider.fields).map(field => [field, { ...stringField, label: field }])),
  AUTH_UKEY: { type: 'boolean', label: 'Enable' },
  AUTH_UKEY_ENROLL_ENABLED: { type: 'boolean', label: 'Enrollment' },
  AUTH_UKEY_VENDOR: {
    type: 'choice', choices: [{ value: 'ji_da', label: 'JIT' }, { value: 'long_mai', label: 'Longmai' }]
  },
  AUTH_UKEY_CA_PROVIDER: {
    type: 'choice', choices: providers.map(provider => ({ value: provider.id, label: provider.label }))
  },
  AUTH_UKEY_CHALLENGE_TTL: { type: 'integer' },
  [TLS_VERIFY]: { type: 'choice', label: 'TLS verification', choices: trustChoices },
  AUTH_UKEY_XJCA_TLS_VERIFY: { type: 'choice', label: 'TLS verification', choices: trustChoices },
  [CA_CONFIGURED]: { type: 'boolean', read_only: true }
}

const localVue = createLocalVue()
localVue.use(ElementUI)
localVue.directive('sanitize', (el, binding) => { el.textContent = binding.value })
const logger = { debug: jest.fn() }
Vue.$log = logger
global._ = _

async function settle() {
  await new Promise(resolve => setTimeout(resolve, 0))
  await Vue.nextTick()
}

async function createForm(initial = {}, translate = key => testLabels[key] || key) {
  const saved = {
    AUTH_UKEY: true, AUTH_UKEY_VENDOR: 'ji_da', AUTH_UKEY_CA_PROVIDER: 'vctk_s',
    AUTH_UKEY_CONFIG_REVISION: 'revision-1', AUTH_UKEY_CA_PROVIDERS: providers,
    AUTH_UKEY_CHALLENGE_TTL: 300,
    AUTH_UKEY_ENROLL_ENABLED: true,
    [SERVER_URL]: 'http://vctks.example.com:8000',
    [TLS_VERIFY]: 'system', [TLS_CA]: '', [ISSUING_CA]: '', [CA_CONFIGURED]: true,
    AUTH_UKEY_XJCA_SVS_URL: 'https://fisherman.example.com:443',
    AUTH_UKEY_XJCA_TLS_VERIFY: 'custom', AUTH_UKEY_XJCA_TLS_CA_CERT: '',
    AUTH_UKEY_DEFAULT_PIN: '',
    ...initial
  }
  const stored = _.cloneDeep(saved)
  const axios = {
    get: jest.fn().mockResolvedValue(_.omit(_.cloneDeep(saved), writeOnlyFields)),
    patch: jest.fn((url, values) => {
      Object.assign(stored, values, { AUTH_UKEY_CONFIG_REVISION: 'revision-2' })
      if (values[ISSUING_CA]) stored[CA_CONFIGURED] = true
      return Promise.resolve(_.omit(_.cloneDeep(stored), writeOnlyFields))
    }),
    post: jest.fn().mockResolvedValue({ msg: 'Random generation only; verification not tested.' })
  }
  const wrapper = mount(UKey, {
    localVue,
    mocks: {
      $t: translate, $log: logger, $axios: axios,
      $message: { success: jest.fn(), warning: jest.fn(), error: jest.fn() },
      $route: { name: 'UKeyList', params: {}, query: {} },
      $router: { currentRoute: { name: 'UKeyList' }, push: jest.fn() },
      $store: {
        state: { app: { device: 'desktop' }, common: { inDrawer: false } },
        dispatch: jest.fn(name => Promise.resolve(
          name === 'common/getUrlMeta' ? { actions: { PATCH: _.cloneDeep(remoteMeta) } } : null
        ))
      }
    }
  })
  await settle()
  return { wrapper, axios, stored }
}

function item(wrapper, name) {
  return wrapper.find(`.el-form-item-${name}`)
}

function button(wrapper, title) {
  return wrapper.findAll('.form-buttons button').wrappers.find(candidate => candidate.text() === title)
}

async function setSSL(wrapper, enabled) {
  const toggle = item(wrapper, SSL).find('.el-switch')
  if (toggle.classes().includes('is-checked') !== enabled) toggle.trigger('click')
  await settle()
}

async function submit(wrapper) {
  wrapper.find('.form-buttons .el-button--primary').trigger('click')
  await settle()
}

async function reset(wrapper) {
  button(wrapper, 'Reset').trigger('click')
  await settle()
}

describe('VCTK_S settings in the shared form', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) wrapper.destroy()
  })

  it('renders optional authorization without exposing the saved password and preserves it on save', async () => {
    const form = await createForm({ [AUTH_USER]: 'business', [AUTH_PASSWORD]: 'saved-secret' })
    wrapper = form.wrapper
    expect(item(wrapper, AUTH_USER).find('input').element.value).toBe('business')
    const password = item(wrapper, AUTH_PASSWORD).find('input')
    expect(password.attributes('type')).toBe('password')
    expect(password.element.value).toBe('')
    item(wrapper, AUTH_USER).find('input').setValue('')
    await settle()
    await submit(wrapper)
    expect(form.axios.patch.mock.calls[0][1][AUTH_USER]).toBe('')
    expect(form.axios.patch.mock.calls[0][1]).not.toHaveProperty(AUTH_PASSWORD)
    expect(form.stored[AUTH_PASSWORD]).toBe('saved-secret')
  })

  it('shows the compact HTTP form and preserves saved certificates and administrative settings', async () => {
    const form = await createForm()
    wrapper = form.wrapper
    expect(item(wrapper, CA_CONFIGURED).exists()).toBe(false)
    expect(item(wrapper, 'AUTH_UKEY_DEFAULT_PIN').exists()).toBe(false)
    expect(item(wrapper, SERVER_URL).exists()).toBe(true)
    expect(item(wrapper, SSL).exists()).toBe(true)
    expect(item(wrapper, ISSUING_CA).exists()).toBe(true)
    expect(item(wrapper, TLS_VERIFY).exists()).toBe(false)
    expect(wrapper.find('.ukey-issuing-ca-status').text()).toBe('UKeyVCTKSIssuingCAConfigured')

    await submit(wrapper)
    const submitted = form.axios.patch.mock.calls[0][1]
    expect(submitted).not.toHaveProperty('AUTH_UKEY_DEFAULT_PIN')
    expect(submitted).not.toHaveProperty(SSL)
    expect(submitted).not.toHaveProperty(CA_CONFIGURED)
    expect(submitted).not.toHaveProperty(ISSUING_CA)
    expect(submitted).not.toHaveProperty(TLS_CA)
  })

  it('defaults HTTPS trust to custom and uses the same choices as Xinjiang CA', async () => {
    const form = await createForm({ [SERVER_URL]: 'https://vctks.example.com', [TLS_VERIFY]: undefined })
    wrapper = form.wrapper
    expect(item(wrapper, SSL).find('.el-switch').classes()).toContain('is-checked')
    expect(item(wrapper, TLS_VERIFY).findAll('input').wrappers.map(input => input.element.value)).toEqual(['custom', 'insecure'])
    expect(item(wrapper, TLS_VERIFY).findAll('.el-radio__label').wrappers.map(label => label.text())).toEqual([
      'UKeyTLSCustomCA', 'UKeyTLSInsecure'
    ])
    expect(item(wrapper, TLS_VERIFY).find('input[value="custom"]').element.checked).toBe(true)
    expect(item(wrapper, TLS_CA).exists()).toBe(true)
    expect(item(wrapper, ISSUING_CA).exists()).toBe(true)
    await submit(wrapper)
    expect(form.axios.patch.mock.calls[0][1][TLS_VERIFY]).toBe('custom')
  })

  it('normalizes saved system trust to custom when the URL is empty and SSL is enabled', async () => {
    const form = await createForm({ [SERVER_URL]: '' })
    wrapper = form.wrapper
    expect(item(wrapper, SSL).find('.el-switch').classes()).toContain('is-checked')
    expect(item(wrapper, TLS_VERIFY).find('input[value="system"]').exists()).toBe(false)
    expect(item(wrapper, TLS_VERIFY).find('input[value="custom"]').element.checked).toBe(true)
    expect(item(wrapper, TLS_CA).exists()).toBe(true)
  })

  it('synchronizes the SSL switch and URL without losing TLS values across mode changes', async () => {
    const form = await createForm()
    wrapper = form.wrapper
    await setSSL(wrapper, true)
    expect(item(wrapper, SERVER_URL).find('input').element.value).toBe('https://vctks.example.com:8000')
    item(wrapper, TLS_VERIFY).find('input[value="custom"]').setChecked(true)
    await settle()
    item(wrapper, TLS_CA).find('textarea').setValue('replacement HTTPS CA')
    await settle()
    await setSSL(wrapper, false)
    expect(item(wrapper, TLS_VERIFY).exists()).toBe(false)
    expect(item(wrapper, TLS_CA).exists()).toBe(false)
    item(wrapper, SERVER_URL).find('input').setValue('https://updated.example.com:45679')
    await settle()
    expect(item(wrapper, SSL).find('.el-switch').classes()).toContain('is-checked')
    expect(item(wrapper, TLS_VERIFY).find('input[value="custom"]').element.checked).toBe(true)
    expect(item(wrapper, TLS_CA).find('textarea').element.value).toBe('replacement HTTPS CA')
    item(wrapper, TLS_VERIFY).find('input[value="insecure"]').setChecked(true)
    await settle()
    expect(item(wrapper, TLS_CA).exists()).toBe(false)
    item(wrapper, TLS_VERIFY).find('input[value="custom"]').setChecked(true)
    await settle()
    expect(item(wrapper, TLS_CA).find('textarea').element.value).toBe('replacement HTTPS CA')
    await submit(wrapper)
    expect(form.axios.patch.mock.calls[0][1][SERVER_URL]).toBe('https://updated.example.com:45679')
    expect(form.axios.patch.mock.calls[0][1]).not.toHaveProperty(SSL)
  })

  it('restores the loaded URL, SSL and trust mode on reset before and after saving', async () => {
    const form = await createForm()
    wrapper = form.wrapper
    await setSSL(wrapper, true)
    item(wrapper, TLS_VERIFY).find('input[value="insecure"]').setChecked(true)
    await reset(wrapper)
    expect(item(wrapper, SERVER_URL).find('input').element.value).toBe('http://vctks.example.com:8000')
    expect(item(wrapper, SSL).find('.el-switch').classes()).not.toContain('is-checked')
    await setSSL(wrapper, true)
    expect(item(wrapper, TLS_VERIFY).find('input[value="custom"]').element.checked).toBe(true)
    item(wrapper, SERVER_URL).find('input').setValue('https://saved.example.com')
    await settle()
    await submit(wrapper)
    await reset(wrapper)
    expect(item(wrapper, SERVER_URL).find('input').element.value).toBe('http://vctks.example.com:8000')
    await setSSL(wrapper, true)
    expect(item(wrapper, SERVER_URL).find('input').element.value).toBe('https://vctks.example.com:8000')
  })

  it('uses the read-only CA status and updates it only after a successful upload save', async () => {
    const form = await createForm({ [CA_CONFIGURED]: false })
    wrapper = form.wrapper
    expect(wrapper.find('.ukey-issuing-ca-status').text()).toBe('UKeyVCTKSIssuingCANotConfigured')
    item(wrapper, ISSUING_CA).find('textarea').setValue('replacement issuing CA')
    await settle()
    expect(wrapper.find('.ukey-issuing-ca-status').text()).toBe('UKeyVCTKSIssuingCANotConfigured')
    await submit(wrapper)
    expect(form.axios.patch.mock.calls[0][1][ISSUING_CA]).toBe('replacement issuing CA')
    expect(wrapper.find('.ukey-issuing-ca-status').text()).toBe('UKeyVCTKSIssuingCAConfigured')
    expect(item(wrapper, ISSUING_CA).find('textarea').element.value).toBe('')
    await reset(wrapper)
    expect(wrapper.find('.ukey-issuing-ca-status').text()).toBe('UKeyVCTKSIssuingCAConfigured')
  })

  it('does not infer a missing CA from an old response without configured status', async () => {
    const form = await createForm({ [CA_CONFIGURED]: undefined })
    wrapper = form.wrapper
    expect(wrapper.find('.ukey-issuing-ca-status').text()).toBe('')
    await submit(wrapper)
    expect(form.axios.patch.mock.calls[0][1]).not.toHaveProperty(ISSUING_CA)
  })

  it('renders a visible connection button and tests the current URL without hidden configuration', async () => {
    const form = await createForm()
    wrapper = form.wrapper
    item(wrapper, SERVER_URL).find('input').setValue('https://draft.example.com:45679')
    await settle()
    const testButton = button(wrapper, 'Test')
    expect(testButton.isVisible()).toBe(true)
    expect(testButton.attributes('hidden')).toBeUndefined()
    testButton.trigger('click')
    await settle()
    expect(form.axios.post).toHaveBeenCalledWith('/api/v1/settings/ukey/testing/', {
      AUTH_UKEY_CA_PROVIDER: 'vctk_s', AUTH_UKEY_VENDOR: 'ji_da',
      [SERVER_URL]: 'https://draft.example.com:45679', [TLS_VERIFY]: 'custom'
    }, { disableFlashErrorMsg: true })
    expect(testButton.classes()).not.toContain('is-loading')
    expect(wrapper.vm.$message.success).toHaveBeenCalledWith('Random generation only; verification not tested.')
    expect(form.axios.patch).not.toHaveBeenCalled()
    expect(form.stored[SERVER_URL]).toBe('http://vctks.example.com:8000')
    expect(form.stored.AUTH_UKEY_CONFIG_REVISION).toBe('revision-1')
  })

  it('restores the visible test button after a network failure and retries without saving', async () => {
    const form = await createForm()
    wrapper = form.wrapper
    form.axios.post.mockRejectedValueOnce(new Error('Network timeout'))
    const testButton = button(wrapper, 'Test')
    testButton.trigger('click')
    await settle()
    expect(wrapper.vm.$message.error).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.$message.error).toHaveBeenCalledWith('Network timeout')
    expect(testButton.classes()).not.toContain('is-loading')
    testButton.trigger('click')
    await settle()
    expect(form.axios.post).toHaveBeenCalledTimes(2)
    expect(wrapper.vm.$message.success).toHaveBeenCalledTimes(1)
    expect(form.axios.patch).not.toHaveBeenCalled()
    expect(form.stored.AUTH_UKEY_CONFIG_REVISION).toBe('revision-1')
  })

  it('preserves builtin and Longmai provider controls and connection behavior', async () => {
    const translate = jest.fn(key => testLabels[key] || key)
    const form = await createForm({}, translate)
    wrapper = form.wrapper
    expect(translate).toHaveBeenCalledWith('UKeyTestConnection')
    item(wrapper, 'AUTH_UKEY_CA_PROVIDER').find('input[value="builtin"]').setChecked(true)
    await settle()
    expect(button(wrapper, 'Test')).toBeUndefined()
    expect(item(wrapper, 'AUTH_UKEY_CA_CERT_CONTENT').exists()).toBe(true)
    item(wrapper, 'AUTH_UKEY_VENDOR').find('input[value="long_mai"]').setChecked(true)
    await settle()
    item(wrapper, 'AUTH_UKEY_CA_PROVIDER').find('input[value="xjca"]').setChecked(true)
    await settle()
    expect(item(wrapper, SERVER_URL).exists()).toBe(false)
    expect(item(wrapper, SSL).exists()).toBe(false)
    expect(item(wrapper, 'AUTH_UKEY_XJCA_USE_SSL').exists()).toBe(true)
    expect(item(wrapper, 'AUTH_UKEY_XJCA_TLS_VERIFY').findAll('input').wrappers.map(input => input.element.value)).toEqual(['custom', 'insecure'])
    const testButton = button(wrapper, 'Test')
    expect(testButton.isVisible()).toBe(true)
    expect(translate).toHaveBeenCalledWith('UKeyTestFishermanConnection')
    testButton.trigger('click')
    await settle()
    expect(form.axios.post.mock.calls[0][1]).toEqual({
      AUTH_UKEY_CA_PROVIDER: 'xjca', AUTH_UKEY_VENDOR: 'long_mai',
      AUTH_UKEY_XJCA_SVS_URL: 'https://fisherman.example.com:443', AUTH_UKEY_XJCA_TLS_VERIFY: 'custom'
    })
    translate.mockClear()
    item(wrapper, 'AUTH_UKEY_VENDOR').find('input[value="ji_da"]').setChecked(true)
    await settle()
    item(wrapper, 'AUTH_UKEY_CA_PROVIDER').find('input[value="vctk_s"]').setChecked(true)
    await settle()
    expect(translate).toHaveBeenCalledWith('UKeyTestConnection')
    expect(button(wrapper, 'Test').isVisible()).toBe(true)
    expect(form.axios.patch).not.toHaveBeenCalled()
  })
})
