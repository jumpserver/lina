import i18n from '@/i18n/i18n'
import ProtocolSelector from '@/components/Form/FormFields/ProtocolSelector'
import AssetAccounts from '@/views/assets/Asset/AssetCreateUpdate/components/AssetAccounts'
import rules from '@/components/Form/DataForm/rules'
import { JSONManyToManySelect, NestedObjectSelect2, Select2 } from '@/components/Form/FormFields'
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

const reconcileAssetProtocols = (
  currentProtocols = [],
  platformProtocols = [],
  restoreCurrent = false
) => {
  const currentPorts = new Map(currentProtocols.map((protocol) => [protocol.name, protocol.port]))
  const supported = new Map(platformProtocols.map((protocol) => [protocol.name, protocol]))
  const initialDefaults = platformProtocols.filter(
    (protocol) => protocol.primary || protocol.required || protocol.default
  )
  const requiredProtocols = platformProtocols.filter(
    (protocol) => protocol.primary || protocol.required
  )
  let protocols = restoreCurrent
    ? currentProtocols
        .filter((protocol) => supported.has(protocol.name))
        .map((protocol) => supported.get(protocol.name))
    : initialDefaults
  const missingProtocols = restoreCurrent ? requiredProtocols : initialDefaults
  missingProtocols.forEach((protocol) => {
    if (!protocols.some((item) => item.name === protocol.name)) {
      protocols.push(protocol)
    }
  })
  if (protocols.length === 0) {
    protocols = platformProtocols.slice(0, 1)
  }
  return protocols.map((protocol) => ({
    name: protocol.name,
    port: currentPorts.has(protocol.name) ? currentPorts.get(protocol.name) : protocol.port
  }))
}

async function updatePlatformProtocols(
  vm,
  platformType,
  updateForm,
  platformChanged,
  currentProtocols,
  savedPlatformProtocols,
  selectedPlatform,
  isLatest,
  onApplied
) {
  const requestedPlatformID = vm.platformID
  const initialized = await vm.setInitial(requestedPlatformID)
  if (!initialized || !isLatest() || String(vm.platformID) !== String(requestedPlatformID)) {
    return
  }

  await vm.setPlatformConstrains()
  if (!isLatest()) return
  const platformProtocols = vm.platform.protocols || []
  const protocolNames = platformProtocols.map((protocol) => protocol.name)
  console.info('[AssetPlatformProtocol] loaded', {
    selected: selectedPlatform,
    requestedId: requestedPlatformID,
    returnedId: vm.platform.id,
    returnedName: vm.platform.name,
    protocols: protocolNames
  })

  if (platformChanged) {
    const restoreSaved = savedPlatformProtocols !== undefined
    const protocols = reconcileAssetProtocols(
      restoreSaved ? savedPlatformProtocols : currentProtocols,
      platformProtocols,
      restoreSaved
    )
    onApplied(protocols, requestedPlatformID)
    updateForm({ protocols })
    console.info('[AssetPlatformProtocol] applied', {
      platformId: requestedPlatformID,
      choices: protocolNames,
      value: protocols.map((protocol) => protocol.name),
      restored: restoreSaved
    })
  }

  if (platformType === 'website') {
    const setting = Array.isArray(platformProtocols)
      ? platformProtocols[0].setting
      : platformProtocols.setting
    updateForm({
      autofill: setting.autofill ? setting.autofill : 'basic',
      password_selector: setting.password_selector,
      script: setting.script,
      submit_selector: setting.submit_selector,
      username_selector: setting.username_selector
    })
  }
}

export const assetFieldsMeta = (vm, category, type) => {
  const platformCategory = category || vm.$route.query.category
  const platformType = type || vm.$route.query.type
  const platformProtocols = []
  const secretTypes = []
  const asset = { address: 'https://example:8443' }
  let currentProtocols = []
  const savedProtocols = new Map()
  let appliedPlatformID
  let pendingPlatformID
  let refreshSequence = 0
  let selectedPlatform
  const updatePlatform = _.debounce(async ([event], updateForm) => {
    // Select2 emits the selected id in Vue 3, while older form controls emitted
    // the selected option object. Accept both shapes so the platform detail and
    // its protocol choices are refreshed after a platform change.
    const pk = event?.pk ?? event?.id ?? event?.value ?? event
    const hasPlatform = pk !== undefined && pk !== null && pk !== ''
    const platformChanged = hasPlatform && String(pk) !== String(vm.platformID)
    const sequence = ++refreshSequence
    console.info('[AssetPlatformProtocol] selected', {
      id: pk,
      label: selectedPlatform?.label,
      previousId: vm.platformID,
      changed: platformChanged
    })
    if (platformChanged) {
      if (appliedPlatformID !== undefined) {
        savedProtocols.set(appliedPlatformID, _.cloneDeep(currentProtocols))
      }
      pendingPlatformID = String(pk)
      vm.platformID = pk
    }
    const requestedPlatformID = String(vm.platformID)
    try {
      await updatePlatformProtocols(
        vm,
        platformType,
        updateForm,
        platformChanged,
        _.cloneDeep(currentProtocols),
        savedProtocols.get(requestedPlatformID),
        _.cloneDeep(selectedPlatform),
        () => sequence === refreshSequence,
        (protocols, platformID) => {
          appliedPlatformID = String(platformID)
          currentProtocols = _.cloneDeep(protocols)
          if (pendingPlatformID === appliedPlatformID) {
            pendingPlatformID = undefined
          }
        }
      )
    } finally {
      if (sequence === refreshSequence && pendingPlatformID === requestedPlatformID) {
        pendingPlatformID = undefined
      }
    }
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
          if (pendingPlatformID !== undefined) return
          currentProtocols = Array.isArray(value)
            ? value.map((protocol) => ({ name: protocol.name, port: protocol.port }))
            : []
          if (
            appliedPlatformID === undefined &&
            vm.platformID !== undefined &&
            vm.platformID !== null &&
            vm.platformID !== ''
          ) {
            appliedPlatformID = String(vm.platformID)
          }
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
        changeOptions: ([option]) => {
          selectedPlatform = option
        },
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
      component: Select2,
      rules: [rules.RequiredChange],
      el: {
        multiple: true,
        ajax: {
          url: '/api/v1/assets/nodes/',
          transformOption: (item) => {
            return { label: `${item.full_value}`, value: item.id }
          }
        },
        clearable: true
      }
    },
    labels: {
      name: 'labels',
      type: 'm2m',
      component: NestedObjectSelect2,
      el: {
        multiple: true,
        url: '/api/v1/labels/labels/',
        ajax: {
          transformOption: (item) => {
            return { label: `${item.name}:${item.value}`, value: `${item.id}` }
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
      resource: vm.$t('Asset'),
      select2: {
        url: '/api/v1/assets/assets/',
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
