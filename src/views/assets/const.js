import i18n from '@/i18n/i18n'
import ProtocolSelector from '@/components/Form/FormFields/ProtocolSelector'
import AssetAccounts from '@/views/assets/Asset/AssetCreateUpdate/components/AssetAccounts'
import rules from '@/components/Form/DataForm/rules'
import { JSONManyToManySelect, NestedObjectSelect2, Select2 } from '@/components/Form/FormFields'
import { message } from '@/utils/message'

export const filterSelectValues = (values) => {
  if (!values) return
  const selects = []
  values.forEach((item) => {
    if (item.hasOwnProperty('pk')) {
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

function updatePlatformProtocols(vm, platformType, updateForm, platformChanged = false) {
  setTimeout(() => vm.init().then(() => {
    const isCreate = vm.$route.query.action === 'create' && vm?.$route?.query.clone_from === undefined
    const needModify = isCreate || platformChanged
    const platformProtocols = vm.platform.protocols
    if (!needModify) return
    if (platformType === 'website') {
      const setting = Array.isArray(platformProtocols) ? platformProtocols[0].setting : platformProtocols.setting
      updateForm({
        'autofill': setting.autofill ? setting.autofill : 'basic',
        'password_selector': setting.password_selector,
        'script': setting.script,
        'submit_selector': setting.submit_selector,
        'username_selector': setting.username_selector
      })
    }
    // 这里不能清空，比如 gateway 切换时，protocol 没有变化，就会出现 bug, tapd: 1053282
    // updateForm({ protocols: [] })
    vm.iConfig.fieldsMeta.protocols.el.choices = platformProtocols
  }), 100)
}

export const assetFieldsMeta = (vm, category, type) => {
  const platformCategory = category || vm.$route.query.category
  const platformType = type || vm.$route.query.type
  const platformProtocols = []
  const secretTypes = []
  const asset = { address: 'https://jumpserver:330' }
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
          const protocolSecretTypes = platformProtocols.reduce((pre, cur) => {
            pre[cur.name] = cur['secret_types']
            return pre
          }, {})
          const _secretTypes = value.map(v => v.name).reduce((pre, name) => {
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
        change: _.debounce(([event], updateForm) => {
          const pk = event.pk
          vm.platformID = pk
          updatePlatformProtocols(vm, platformType, updateForm, true)
        }, 200),
        input: _.debounce(([event], updateForm) => {
          // 初始化的时候，mounted 中没有这个逻辑
          updatePlatformProtocols(vm, platformType, updateForm)
        }, 200)
      }
    },
    domain: {
      component: Select2,
      disabled: false,
      el: {
        multiple: false,
        clearable: true,
        ajax: {
          url: '/api/v1/assets/domains/'
        }
      },
      hidden: () => {
        return vm.platform.domain_enabled === false
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
      rules: [rules.RequiredChange],
      el: {
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
      _types.push(...category.types.map(item => ({ value: item.value, label: item.label })))
      for (const type of category.types) {
        _protocols.push(...type.constraints.protocols?.map(item => ({
          value: item.name,
          label: item.name.toUpperCase()
        })))
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
