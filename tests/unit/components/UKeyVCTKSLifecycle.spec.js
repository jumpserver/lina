import Vue from 'vue'
import { mount } from '@vue/test-utils'
import Panel from '@/components/Apps/UKeyPanel/index.vue'

jest.mock('@/layout/components/Page/TwoColPage.vue', () => ({ render: h => h('div') }))
jest.mock('@/components/Common/IBox', () => ({ render: h => h('div') }))

const binding = { bound: true, hardware_serial: 'saved-device', certificate_fingerprint: 'saved-fingerprint', binding_version: 'v1' }
function config() {
  return {
    config: {
      vendor: 'ji_da', provider: 'vctk_s', revision: 'r1', certType: 1,
      capabilities: { binding_mode: 'certificate' },
      api: { certificate_binding_url: '/binding/{user_id}/' }
    },
    sdk: { create: { constructor: 'LifecycleUKey' } },
    info: { device: [], cert: [{ key: 'cn', label: 'CN', call: 'UKey_GetCertInfo', args: [1, 9] }] },
    operations: { items: [
      { key: 'bindUserUKeySN', scope: 'admin' },
      { key: 'unbindUserUKeySN', scope: 'admin', requires_device: false }
    ] }
  }
}
function createVM(mode = 'admin') {
  const vm = { mode, object: { id: 'one' }, publicSettings: {}, $t: k => k }
  Object.assign(vm, Panel.data.call(vm))
  Object.entries(Panel.methods).forEach(([key, fn]) => { vm[key] = fn.bind(vm) })
  Object.entries(Panel.computed).forEach(([key, fn]) => {
    if (key !== 'publicSettings') Object.defineProperty(vm, key, { get: () => fn.call(vm) })
  })
  vm.appendLog = jest.fn()
  vm.$message = { warning: jest.fn(), error: jest.fn() }
  vm.$axios = { get: jest.fn(url => Promise.resolve(url.startsWith('/binding/') ? { bound: false } : config())) }
  vm.loadSDKScript = jest.fn(() => vm.initSDKInstance())
  return vm
}
async function flush() {
  for (let i = 0; i < 30; i++) await Promise.resolve()
}
function deferred() {
  let resolve
  const promise = new Promise(r => { resolve = r })
  return { promise, resolve }
}

describe('Jida VCTK_S binding-first page lifecycle', () => {
  let vm, sdk, wrapper
  beforeEach(() => {
    jest.useFakeTimers()
    sdk = {
      UKey_GetDevSN: jest.fn(() => 'local-device'),
      UKey_GetCertInfo: jest.fn(() => JSON.stringify({ SubjectCN: 'certificate-user' }))
    }
    window.LifecycleUKey = jest.fn(function() { Object.assign(this, sdk) })
    vm = createVM()
  })
  afterEach(() => {
    if (wrapper) wrapper.destroy()
    wrapper = null
    Panel.beforeDestroy.call(vm)
    delete window.LifecycleUKey
    jest.useRealTimers()
  })

  it('waits for binding, then reads local certificate details once even when already bound', async () => {
    const pending = deferred()
    vm.$axios.get.mockImplementation(url => url.startsWith('/binding/') ? pending.promise : Promise.resolve(config()))
    const entered = vm.enterPage()
    await flush()
    expect(vm.loadSDKScript).not.toHaveBeenCalled()
    pending.resolve(binding)
    await entered
    expect(vm.loadSDKScript).toHaveBeenCalledTimes(1)
    expect(window.LifecycleUKey).toHaveBeenCalledTimes(1)
    expect(sdk.UKey_GetCertInfo.mock.calls).toEqual([[1, 14]])
    expect(vm.hasCert).toBe(true)
    expect(vm.certInfoItems[0].value).toBe('certificate-user')
    expect(vm.certificateBinding).toBe(binding)
    expect(vm.statusItems).toHaveLength(2)
    expect(vm.visibleOperations.map(op => op.key)).toEqual(['unbindUserUKeySN'])
    const serialCalls = sdk.UKey_GetDevSN.mock.calls.length
    await vm.pollStatus()
    jest.advanceTimersByTime(15000)
    await flush()
    expect(vm.pollTimer).toBe(null)
    expect(sdk.UKey_GetDevSN).toHaveBeenCalledTimes(serialCalls)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
  })

  it('does not treat a failed binding query as unbound', async () => {
    vm.$axios.get.mockImplementation(url => url.startsWith('/binding/') ? Promise.reject(new Error('denied')) : Promise.resolve(config()))
    await vm.enterPage()
    expect(vm.configLoaded).toBe(false)
    expect(vm.refreshRequired).toBe(true)
    expect(vm.loadSDKScript).not.toHaveBeenCalled()
  })

  it('reads once per unbound entry, never on a normal device poll', async () => {
    await vm.enterPage()
    expect(sdk.UKey_GetCertInfo.mock.calls).toEqual([[1, 14]])
    vm.checkConfigRevision = jest.fn().mockResolvedValue(true)
    for (let i = 0; i < 5; i++) await vm.pollStatus()
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
    Panel.deactivated.call(vm)
    jest.advanceTimersByTime(15000)
    await flush()
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
    Panel.activated.call(vm)
    await flush()
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(2)
    expect(vm.$axios.get.mock.calls.filter(([url]) => url === '/binding/one/')).toHaveLength(2)
  })

  it.each([
    ['cancel', false], ['invalid', false], ['cancel', true], ['invalid', true]
  ])('does not retry %s certificate reads while the device remains connected (bound=%s)', async (failure, bound) => {
    if (bound) vm.$axios.get.mockImplementation(url => Promise.resolve(url.startsWith('/binding/') ? binding : config()))
    if (failure === 'cancel') sdk.UKey_GetCertInfo.mockImplementation(() => { throw new Error('canceled') })
    else sdk.UKey_GetCertInfo.mockReturnValue('invalid-json')
    await vm.enterPage()
    vm.checkConfigRevision = jest.fn().mockResolvedValue(true)
    await vm.pollStatus()
    await vm.pollStatus()
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
    expect(vm.hasCert).toBe(false)
  })

  it('clears the device on removal and reads once after reconnect or serial change', async () => {
    await vm.enterPage()
    vm.checkConfigRevision = jest.fn().mockResolvedValue(true)
    sdk.UKey_GetDevSN.mockReturnValue('')
    await vm.pollStatus()
    expect(vm.hasCert).toBe(false)
    expect(vm.ukeySnapshot.connected).toBe(false)
    sdk.UKey_GetDevSN.mockReturnValue('local-device')
    await vm.pollStatus()
    await vm.pollStatus()
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(2)
    sdk.UKey_GetDevSN.mockReturnValue('another-device')
    await vm.pollStatus()
    await vm.pollStatus()
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(3)
  })

  it('does not rearm certificate selection after transient device-check errors', async () => {
    await vm.enterPage()
    vm.checkConfigRevision = jest.fn().mockResolvedValue(true)
    sdk.UKey_GetDevSN.mockImplementationOnce(() => { throw new Error('network') })
    await vm.pollStatus()
    expect(vm.ukeySnapshot.connected).toBe(false)
    await vm.pollStatus()
    expect(vm.ukeySnapshot.connected).toBe(true)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
  })

  it('does not fall through to certificate reads when revision checks fail', async () => {
    await vm.enterPage()
    vm.checkConfigRevision = jest.fn().mockRejectedValue(new Error('network'))
    await vm.pollStatus()
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
    expect(vm.polling).toBe(false)
  })

  it('ignores late config or binding responses after leaving the tab', async () => {
    const pending = deferred()
    vm.$axios.get.mockReturnValue(pending.promise)
    const entered = vm.enterPage()
    Panel.deactivated.call(vm)
    pending.resolve(config())
    await entered
    expect(vm.loadSDKScript).not.toHaveBeenCalled()
    expect(vm.configLoaded).toBe(false)
  })

  it('does not apply an old user binding after switching managed users', async () => {
    const pending = deferred()
    vm.$axios.get.mockImplementation(url => {
      if (url === '/binding/one/') return pending.promise
      return Promise.resolve(url === '/binding/two/' ? { bound: false } : config())
    })
    const first = vm.enterPage()
    await flush()
    vm.object = { id: 'two' }
    Panel.watch['object.id'].call(vm)
    await flush()
    pending.resolve(binding)
    await first
    expect(vm.certificateBinding.bound).toBe(false)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
  })

  it('stops a suspended poll from reading certificates or restarting timers after leaving', async () => {
    await vm.enterPage()
    const pending = deferred()
    vm.checkConfigRevision = jest.fn(() => pending.promise)
    const polled = vm.pollStatus()
    Panel.deactivated.call(vm)
    pending.resolve(true)
    await polled
    expect(vm.pollTimer).toBe(null)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
  })

  it('ignores a late script load and initializes only the current page entry', async () => {
    vm.config = config().config
    vm.config.api.ukey_sdk_script_url = '/sdk.js'
    vm.sdkConfig = config()
    vm.sdkConfig.config = vm.config
    vm.loadSDKScript = Panel.methods.loadSDKScript.bind(vm)
    delete window.LifecycleUKey
    vm.loadSDKScript()
    const script = document.getElementById('ukey-sdk-script')
    Panel.deactivated.call(vm)
    vm.pageActive = true
    vm.pageEpoch++
    vm.loadSDKScript()
    window.LifecycleUKey = jest.fn(function() { Object.assign(this, sdk) })
    script.dispatchEvent(new Event('load'))
    await flush()
    expect(window.LifecycleUKey).toHaveBeenCalledTimes(1)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
    script.remove()
  })

  it('prevents an old panel from reading another panel SDK singleton', async () => {
    await vm.enterPage()
    const previous = vm
    vm = createVM()
    await vm.enterPage()
    previous.checkConfigRevision = jest.fn().mockResolvedValue(true)
    await previous.pollStatus()
    await previous.readCertInfo()
    expect(previous.hasCert).toBe(false)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(2)
    Panel.beforeDestroy.call(previous)
  })

  it.each([
    ['ji_da', 'builtin'], ['long_mai', 'builtin'], ['long_mai', 'xjca']
  ])('keeps normal certificate polling and tab behavior for %s / %s', async (vendor, provider) => {
    vm.config = { vendor, provider }
    vm.configLoaded = true
    vm.sdkConfig = config()
    await vm.initSDKInstance()
    vm.checkConfigRevision = jest.fn().mockResolvedValue(true)
    await vm.pollStatus()
    expect(sdk.UKey_GetCertInfo.mock.calls).toEqual([[1, 9], [1, 9]])
    Panel.deactivated.call(vm)
    expect(vm.pageActive).toBe(true)
    await vm.pollStatus()
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(3)
  })

  it('preserves displayed details without extra reads on binding and reinitializes once after unbinding', async () => {
    await vm.enterPage()
    vm.applyRegister('ukey.binding', binding, {})
    await vm.handleEvents(['refresh.info.device', 'refresh.info.cert'])
    expect(vm.pollTimer).toBe(null)
    expect(vm.hasCert).toBe(true)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
    vm.applyRegister('ukey.binding', { bound: false }, {})
    await vm.handleEvents('refresh.info.device')
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(2)
    Panel.deactivated.call(vm)
    await vm.handleEvents('refresh.info.device')
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(2)
  })

  it('unbinds without a connected UKey after the initial bound-page detection', async () => {
    sdk.UKey_GetDevSN.mockReturnValue('')
    vm.$axios.get.mockImplementation(url => Promise.resolve(url.startsWith('/binding/') ? binding : config()))
    await vm.enterPage()
    vm.checkConfigRevision = jest.fn().mockResolvedValue(true)
    vm.executeApiStep = jest.fn().mockResolvedValue({ bound: false })
    vm.pageActive = true
    // Stop after the API step to verify unbind itself has no hardware dependency.
    vm.handleEvents = jest.fn()
    await vm.handleOperation({ key: 'unbindUserUKeySN', steps: [{ type: 'api', register: 'ukey.binding' }] })
    expect(vm.executeApiStep).toHaveBeenCalledTimes(1)
    expect(vm.certificateBinding.bound).toBe(false)
    expect(window.LifecycleUKey).toHaveBeenCalledTimes(1)
    expect(sdk.UKey_GetCertInfo).not.toHaveBeenCalled()
  })

  it('keeps unbinding available even if the local SDK fails to initialize', async () => {
    vm.$axios.get.mockImplementation(url => Promise.resolve(url.startsWith('/binding/') ? binding : config()))
    delete window.LifecycleUKey
    await vm.enterPage()
    expect(vm.sdkLoaded).toBe(false)
    expect(vm.refreshRequired).toBe(false)
    expect(vm.ukeySnapshot.binding).toBe(binding)
    vm.checkConfigRevision = jest.fn().mockResolvedValue(true)
    vm.executeApiStep = jest.fn().mockResolvedValue({ bound: false })
    vm.handleEvents = jest.fn()
    await vm.handleOperation({ key: 'unbindUserUKeySN', steps: [{ type: 'api', register: 'ukey.binding' }] })
    expect(vm.executeApiStep).toHaveBeenCalledTimes(1)
    expect(vm.certificateBinding.bound).toBe(false)
    expect(sdk.UKey_GetCertInfo).not.toHaveBeenCalled()
  })

  it('does not continue a PIN operation after the tab is left', async () => {
    await vm.enterPage()
    vm.checkConfigRevision = jest.fn().mockResolvedValue(true)
    const pending = deferred()
    vm.showInputDialog = jest.fn(() => pending.promise)
    const step = vm.executeStep({ call: 'UKey_GetDevSN', input: { fields: [] } }, {})
    const assertion = expect(step).rejects.toThrow('OperationCanceled')
    Panel.deactivated.call(vm)
    sdk.UKey_GetDevSN.mockClear()
    pending.resolve({ pin: 'not-logged' })
    await assertion
    expect(sdk.UKey_GetDevSN).not.toHaveBeenCalled()
  })

  it('reads once on bound ordinary-user pages without exposing admin operations', async () => {
    vm = createVM('user')
    const loaded = config()
    loaded.config.own_binding = { ...binding, user_id: 'one' }
    vm.$axios.get.mockResolvedValue(loaded)
    await vm.enterPage()
    expect(vm.certificateBinding.bound).toBe(true)
    expect(vm.visibleOperations).toEqual([])
    expect(vm.loadSDKScript).toHaveBeenCalledTimes(1)
    expect(sdk.UKey_GetCertInfo.mock.calls).toEqual([[1, 14]])
    expect(vm.pollTimer).toBe(null)
    expect(vm.$axios.get).toHaveBeenCalledTimes(1)
  })

  it('does not start the SDK for an unbound ordinary user', async () => {
    vm = createVM('user')
    await vm.enterPage()
    expect(vm.certificateBinding.bound).toBe(false)
    expect(vm.visibleOperations).toEqual([])
    expect(vm.loadSDKScript).not.toHaveBeenCalled()
  })

  it.each([true, false])('preserves the ordinary-user device-matching information gate (matches=%s)', async matches => {
    vm = createVM('user')
    const loaded = config()
    loaded.config.own_binding = { ...binding, user_id: 'one' }
    loaded.info.when = '{{ ukey.binding.bound && ukey.devSN === ukey.binding.hardware_serial }}'
    sdk.UKey_GetDevSN.mockReturnValue(matches ? binding.hardware_serial : 'another-device')
    vm.$axios.get.mockResolvedValue(loaded)
    await vm.enterPage()
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(matches ? 1 : 0)
    expect(vm.hasCert).toBe(matches)
    expect(vm.certificateBinding).toBe(loaded.config.own_binding)
  })

  it('mounts and reactivates a real keep-alive panel without duplicate initial reads', async () => {
    const script = document.createElement('script')
    script.id = 'ukey-sdk-script'
    script.dataset.vendor = 'ji_da'
    script.dataset.provider = 'vctk_s'
    document.body.appendChild(script)
    const get = jest.fn(url => Promise.resolve(url.startsWith('/binding/') ? binding : config()))
    wrapper = mount({
      data: () => ({ shown: false }),
      render(h) { return h('keep-alive', [this.shown ? h(Panel, { props: { mode: 'admin', object: { id: 'one' } } }) : h('div')]) }
    }, {
      mocks: { $t: k => k, $axios: { get }, $store: { getters: { publicSettings: {} } } },
      stubs: ['el-dialog', 'el-form', 'el-alert', 'el-button', 'el-empty']
    })
    await flush()
    expect(get).not.toHaveBeenCalled()
    wrapper.setData({ shown: true })
    await Vue.nextTick()
    await flush()
    expect(get.mock.calls.filter(([url]) => url === '/binding/one/')).toHaveLength(1)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
    wrapper.setData({ shown: false })
    await Vue.nextTick()
    wrapper.setData({ shown: true })
    await Vue.nextTick()
    await flush()
    expect(get.mock.calls.filter(([url]) => url === '/binding/one/')).toHaveLength(2)
    expect(window.LifecycleUKey).toHaveBeenCalledTimes(2)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(2)
    script.remove()
  })

  it('reads exactly once on each real unbound keep-alive activation', async () => {
    const script = document.createElement('script')
    script.id = 'ukey-sdk-script'
    script.dataset.vendor = 'ji_da'
    script.dataset.provider = 'vctk_s'
    document.body.appendChild(script)
    const get = jest.fn(url => Promise.resolve(url.startsWith('/binding/') ? { bound: false } : config()))
    wrapper = mount({
      data: () => ({ shown: true }),
      render(h) { return h('keep-alive', [this.shown ? h(Panel, { props: { mode: 'admin', object: { id: 'one' } } }) : h('div')]) }
    }, {
      mocks: { $t: k => k, $axios: { get }, $store: { getters: { publicSettings: {} } } },
      stubs: ['el-dialog', 'el-form', 'el-alert', 'el-button', 'el-empty']
    })
    await flush()
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
    wrapper.setData({ shown: false })
    await Vue.nextTick()
    const serialCalls = sdk.UKey_GetDevSN.mock.calls.length
    jest.advanceTimersByTime(15000)
    await flush()
    expect(sdk.UKey_GetDevSN).toHaveBeenCalledTimes(serialCalls)
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(1)
    wrapper.setData({ shown: true })
    await Vue.nextTick()
    await flush()
    expect(sdk.UKey_GetCertInfo).toHaveBeenCalledTimes(2)
    script.remove()
  })
})
