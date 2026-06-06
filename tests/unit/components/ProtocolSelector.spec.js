import { shallowMount } from '@vue/test-utils'

jest.mock('@/components/Form/FormFields/ProtocolSelector/ProtocolSettingDialog.vue', () => ({
  name: 'ProtocolSettingDialog',
  render(h) {
    return h('div')
  }
}))

import ProtocolSelector from '@/components/Form/FormFields/ProtocolSelector/index.vue'

const mountSelector = (propsData) => shallowMount(ProtocolSelector, {
  propsData,
  stubs: ['el-button', 'el-input', 'el-option', 'el-select'],
  mocks: {
    $t: key => key,
    $log: {
      debug: jest.fn()
    }
  }
})

describe('ProtocolSelector.vue', () => {
  it('resets stale asset protocols when platform choices change', () => {
    const wrapper = mountSelector({
      settingReadonly: true,
      value: [
        { name: 'rdp', port: 3389 },
        { name: 'ssh', port: 22 }
      ],
      choices: [
        { name: 'rdp', port: 3389, primary: true },
        { name: 'ssh', port: 22 }
      ]
    })

    wrapper.vm.setDefaultItems([
      { name: 'ssh', port: 22, primary: true },
      { name: 'sftp', port: 22, default: true }
    ])

    expect(wrapper.vm.items.map(item => item.name)).toEqual(['ssh', 'sftp'])
  })

  it('initializes default protocols when asset protocols are empty', () => {
    const wrapper = mountSelector({
      settingReadonly: true,
      value: [],
      choices: []
    })

    wrapper.vm.setDefaultItems([
      { name: 'ssh', port: 22, primary: true },
      { name: 'sftp', port: 22, default: true }
    ])

    expect(wrapper.vm.items.map(item => item.name)).toEqual(['ssh', 'sftp'])
  })

  it('keeps supported asset protocols when platform choices remain compatible', () => {
    const wrapper = mountSelector({
      settingReadonly: true,
      value: [
        { name: 'ssh', port: 2222 }
      ],
      choices: [
        { name: 'ssh', port: 22, primary: true },
        { name: 'sftp', port: 22, default: true }
      ]
    })

    wrapper.vm.setDefaultItems([
      { name: 'ssh', port: 22, primary: true },
      { name: 'sftp', port: 22, default: true }
    ])

    expect(wrapper.vm.items).toEqual([
      { name: 'ssh', port: 2222, primary: true }
    ])
  })

  it('adds required protocols missing from compatible asset protocols', () => {
    const wrapper = mountSelector({
      settingReadonly: true,
      value: [
        { name: 'ssh', port: 2222 }
      ],
      choices: [
        { name: 'ssh', port: 22, primary: true },
        { name: 'sftp', port: 22, required: true }
      ]
    })

    wrapper.vm.setDefaultItems([
      { name: 'ssh', port: 22, primary: true },
      { name: 'sftp', port: 22, required: true }
    ])

    expect(wrapper.vm.items).toEqual([
      { name: 'ssh', port: 2222, primary: true },
      { name: 'sftp', port: 22, required: true }
    ])
  })
})
