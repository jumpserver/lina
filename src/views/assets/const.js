import i18n from '@/i18n/i18n'
import ProtocolSelector from '@/components/Form/FormFields/ProtocolSelector'
import AssetAccounts from '@/views/assets/Asset/AssetCreateUpdate/components/AssetAccounts'
import rules from '@/components/Form/DataForm/rules'
import { ColorSwatchFormatter } from '@/components/Table/TableFormatters'
import {
  JSONManyToManySelect,
  ResourceSelect,
  Select2,
  TreeResourceSelect
} from '@/components/Form/FormFields'
import { message } from '@/utils/vue/message'

export const filterSelectValues = (values) => {
  if (!values) return
  const selects = []
  values.forEach((item) => {
    if (Object.prototype.hasOwnProperty.call(item, 'pk')) {
      selects.push(item)
    } else {
      // 格式校验：不以:开头，不以:结尾
      const reg = /^:|:$/
      if (item.name.indexOf(':') > -1 && !reg.test(item.name)) {
        const [name, value] = item.name.split(':')
        const inputValue = { name, value }
        selects.push(inputValue)
      } else {
        message.error(i18n.t('LabelInputFormatValidation'))
      }
    }
  })
  return selects
}

export const reloadPlatformProtocols = (platformProtocols, currentProtocols) => {
  const currentByName = new Map(
    (Array.isArray(currentProtocols) ? currentProtocols : []).map((protocol) => [
      protocol.name,
      protocol
    ])
  )

  return (Array.isArray(platformProtocols) ? platformProtocols : []).map(({ name, port }) => ({
    name,
    port: currentByName.get(name)?.port ?? port
  }))
}

export const getWebAssetSettingDefaults = (platformProtocols) => {
  const protocols = Array.isArray(platformProtocols) ? platformProtocols : [platformProtocols]
  const protocol =
    protocols.find((item) => item?.name === 'http') ||
    protocols.find((item) => item?.primary) ||
    protocols[0]
  const setting = protocol?.setting
  if (!setting) {
    return {}
  }
  return {
    autofill: setting.autofill || 'basic',
    password_selector: setting.password_selector,
    script: setting.script,
    submit_selector: setting.submit_selector,
    username_selector: setting.username_selector
  }
}

async function updatePlatformProtocols(
  vm,
  platformCategory,
  updateForm,
  platformChanged,
  currentProtocols,
  isLatest
) {
  const requestedPlatformID = vm.platformID
  const initialized = await vm.setInitial(requestedPlatformID)
  if (!initialized || !isLatest() || String(vm.platformID) !== String(requestedPlatformID)) {
    return
  }

  await vm.setPlatformConstrains()
  if (!isLatest()) return
  const platformProtocols = vm.platform.protocols || []

  const formUpdates = {}
  if (platformChanged) {
    formUpdates.protocols = reloadPlatformProtocols(platformProtocols, currentProtocols)
  }

  const isCreate = !vm.$context.get('id') && !vm.$context.get('clone_from')
  if (platformCategory === 'web' && (isCreate || platformChanged)) {
    Object.assign(formUpdates, getWebAssetSettingDefaults(platformProtocols))
  }

  if (Object.keys(formUpdates).length > 0) {
    updateForm(formUpdates)
  }
}

export const assetFieldsMeta = (vm, category, type) => {
  const platformCategory = category || vm.$context.get('category')
  const platformType = type || vm.$context.get('type')
  const platformProtocols = []
  const secretTypes = []
  const asset = { address: 'https://example:8443' }
  let selectedProtocols = []
  let refreshSequence = 0
  const updatePlatform = _.debounce(async ([event], updateForm) => {
    // Select2 emits the selected id in Vue 3, while older form controls emitted
    // the selected option object. Accept both shapes so the platform detail and
    // its protocol choices are refreshed after a platform change.
    const pk = event?.pk ?? event?.id ?? event?.value ?? event
    const hasPlatform = pk !== undefined && pk !== null && pk !== ''
    const platformChanged = hasPlatform && String(pk) !== String(vm.platformID)
    const sequence = ++refreshSequence
    if (platformChanged) {
      vm.platformID = pk
    }
    const currentProtocols =
      selectedProtocols.length > 0 ? selectedProtocols : vm.iConfig.initial?.protocols
    await updatePlatformProtocols(
      vm,
      platformCategory,
      updateForm,
      platformChanged,
      currentProtocols,
      () => sequence === refreshSequence
    )
  }, 200)
  return {
    address: {
      rules: [rules.specialEmojiCheck, rules.RequiredChange],
      on: {
        change: ([event], updateForm) => {
          asset.address = event
        },
        input: ([event], updateForm) => {
          asset.address = event
        }
      }
    },
    protocols: {
      component: ProtocolSelector,
      el: {
        settingReadonly: true,
        choices: platformProtocols,
        instance: asset
      },
      helpText: i18n.t('AssetProtocolHelpText'),
      on: {
        input: ([value]) => {
          selectedProtocols = Array.isArray(value)
            ? value.map(({ name, port }) => ({ name, port }))
            : []
          const protocolSecretTypes = platformProtocols.reduce((pre, cur) => {
            pre[cur.name] = cur['secret_types']
            return pre
          }, {})
          const _secretTypes = value
            .map((v) => v.name)
            .reduce((pre, name) => {
              if (protocolSecretTypes[name]) {
                return pre.concat(protocolSecretTypes[name])
              }
              return pre
            }, [])
          secretTypes.splice(0, secretTypes.length, ..._secretTypes)
        }
      }
    },
    platform: {
      el: {
        multiple: false,
        ajax: {
          url: `/api/v1/assets/platforms/?category=${platformCategory}&type=${platformType}`,
          transformOption: (item) => {
            return { label: item.name, value: item.id }
          }
        }
      },
      on: {
        change: updatePlatform,
        // 初始化和用户选择都会触发 input；与 change 共用防抖，避免同一次选择重复初始化。
        input: updatePlatform
      }
    },
    zone: {
      disabled: false,
      el: {
        multiple: false,
        clearable: true,
        ajax: {
          url: '/api/v1/assets/zones/'
        }
      }
    },
    accounts: {
      component: AssetAccounts,
      el: {
        platform: {},
        default: []
      }
    },
    directory_services: {
      el: {
        url: '/api/v1/assets/directories/',
        disabled: false
      },
      hidden: () => {
        return vm.platform.ds_enabled === false
      }
    },
    nodes: {
      type: 'treeResourceSelect',
      component: TreeResourceSelect,
      rules: [rules.RequiredChange],
      el: {
        // 不要在 el 里写 value: []，会作为 prop 透传并在表单绑定时干扰节点回填
        url: '/api/v1/assets/nodes/?fields_size=mini',
        treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
        resourceName: vm.$t('Nodes')
      }
    },
    labels: {
      name: 'labels',
      type: 'resourceSelect',
      component: ResourceSelect,
      el: {
        url: '/api/v1/labels/labels/',
        resourceName: vm.$t('Labels'),
        columns: ['name', 'id', 'value', 'color', 'comment'],
        columnsShow: {
          default: ['name', 'value', 'color', 'actions'],
          min: ['name', 'actions']
        },
        columnsMeta: {
          color: {
            formatter: ColorSwatchFormatter
          }
        }
      }
    },
    is_active: {
      type: 'checkbox'
    },
    cluster: {
      label: i18n.t('Cluster')
    },
    url: {
      label: 'url'
    },
    comment: {
      placeholder: i18n.t('CommentHelpText')
    }
  }
}

export const assetJSONSelectMeta = (vm) => {
  const categories = []
  const types = []
  const protocols = []
  vm.$axios.get('/api/v1/assets/categories/').then((res) => {
    const _types = []
    const _protocols = []
    for (const category of res) {
      categories.push({ value: category.value, label: category.label })
      _types.push(...category.types.map((item) => ({ value: item.value, label: item.label })))
      for (const type of category.types) {
        const protocols = type.constraints?.protocols || []
        _protocols.push(
          ...protocols.map((item) => ({
            value: item.name,
            label: item.name.toUpperCase()
          }))
        )
      }
    }
    types.push(..._.uniqBy(_types, 'value'))
    protocols.push(..._.uniqBy(_protocols, 'value'))
  })

  return {
    component: JSONManyToManySelect,
    el: {
      value: [],
      resource: vm.$t('Assets'),
      select2: {
        url: '/api/v1/assets/assets/',
        nodeFilter: {
          treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
          typeTreeUrl: '/api/v1/assets/nodes/category/tree/?count_resource=none',
          includeDescendants: true
        },
        ajax: {
          transformOption: (item) => {
            return { label: item.name + '(' + item.address + ')', value: item.id }
          }
        }
      },
      attrs: [
        {
          name: 'name',
          label: vm.$t('Name'),
          inTable: true
        },
        {
          name: 'address',
          label: vm.$t('Address'),
          type: 'ip',
          inTable: true
        },
        {
          name: 'nodes',
          label: vm.$t('Node'),
          type: 'm2m',
          el: {
            url: '/api/v1/assets/nodes/',
            ajax: {
              transformOption: (item) => {
                return { label: item.full_value, value: item.id }
              }
            }
          }
        },
        {
          name: 'platform',
          label: vm.$t('Platform'),
          type: 'm2m',
          el: {
            url: '/api/v1/assets/platforms/'
          }
        },
        {
          name: 'category',
          label: vm.$t('Category'),
          type: 'select',
          inTable: true,
          formatter: (row, column, cellValue) => cellValue.label,
          el: {
            options: categories
          }
        },
        {
          name: 'type',
          label: vm.$t('Type'),
          type: 'select',
          inTable: true,
          formatter: (row, column, cellValue) => cellValue.label,
          el: {
            options: types
          }
        },
        {
          name: 'protocols',
          label: vm.$t('Protocols'),
          type: 'select',
          el: {
            options: protocols
          }
        },
        {
          name: 'labels',
          label: vm.$t('Tags'),
          type: 'm2m',
          el: {
            multiple: true,
            url: '/api/v1/assets/labels/',
            ajax: {
              transformOption: (item) => {
                return { label: `${item.name}:${item.value}`, value: item.id }
              }
            }
          }
        },
        {
          name: 'comment',
          label: vm.$t('Comment')
        }
      ]
    }
  }
}

export function getAssetSelect2Meta() {
  return {
    component: Select2,
    el: {
      value: [],
      select2: {
        ajax: {
          url: '/api/v1/assets/assets/?fields_size=mini',
          transformOption: (item) => {
            return { label: item.name + '(' + item.address + ')', value: item.id }
          }
        }
      }
    }
  }
}
