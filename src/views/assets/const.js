import i18n from '@/i18n/i18n'
import ProtocolSelector from '@/components/Form/FormFields/ProtocolSelector'
import AssetAccounts from '@/views/assets/Asset/AssetCreateUpdate/components/AssetAccounts'
import rules from '@/components/Form/DataForm/rules'
import { JSONManyToManySelect, Select2 } from '@/components/Form/FormFields'
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
        message.error(i18n.t('assets.LabelInputFormatValidation'))
      }
    }
  })
  return selects
}

export const assetFieldsMeta = (vm) => {
  const platformProtocols = []
  const secretTypes = []
  const platformType = vm?.$route.query?.type
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
      helpText: i18n.t('assets.AssetProtocolHelpText'),
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
      label: i18n.t('assets.PlatformSimple'),
      el: {
        multiple: false,
        ajax: {
          url: `/api/v1/assets/platforms/?type=${platformType}`,
          transformOption: (item) => {
            return { label: item.name, value: item.id }
          }
        }
      },
      on: {
        change: ([event], updateForm) => {
          const pk = event.pk
          const url = window.location.href
          const newURL = url.replace(/platform=[^&]*/, 'platform=' + pk)
          window.location.href = newURL
          setTimeout(() => vm.init(), 100)
        }
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
      }
    },
    accounts: {
      component: AssetAccounts,
      label: i18n.t('assets.Accounts'),
      el: {
        platform: {},
        default: []
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
      label: vm.$t('assets.Label'),
      type: 'm2m',
      component: Select2,
      el: {
        multiple: true,
        url: '/api/v1/labels/labels/',
        ajax: {
          transformOption: (item) => {
            return { label: `${item.name}:${item.value}`, value: `${item.name}:${item.value}` }
          }
        }
      }
    },
    is_active: {
      type: 'switch'
    },
    cluster: {
      label: i18n.t('assets.Cluster')
    },
    url: {
      label: 'url'
    },
    comment: {
      helpText: i18n.t('assets.CommentHelpText')
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
        _protocols.push(...type.constraints.protocols?.map(item => ({ value: item.name, label: item.name.toUpperCase() })))
      }
    }
    types.push(..._.uniqBy(_types, 'value'))
    protocols.push(..._.uniqBy(_protocols, 'value'))
  })

  return {
    component: JSONManyToManySelect,
    el: {
      value: [],
      resource: vm.$t('assets.Asset'),
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
          label: vm.$t('common.Name'),
          inTable: true
        },
        {
          name: 'address',
          label: vm.$t('assets.Address'),
          type: 'ip',
          inTable: true
        },
        {
          name: 'nodes',
          label: vm.$t('assets.Node'),
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
          label: vm.$t('assets.Platform'),
          type: 'fk',
          el: {
            url: '/api/v1/assets/platforms/'
          }
        },
        {
          name: 'category',
          label: vm.$t('assets.Category'),
          type: 'select',
          inTable: true,
          formatter: (row, column, cellValue) => cellValue.label,
          el: {
            options: categories
          }
        },
        {
          name: 'type',
          label: vm.$t('assets.Type'),
          type: 'select',
          inTable: true,
          formatter: (row, column, cellValue) => cellValue.label,
          el: {
            options: types
          }
        },
        {
          name: 'protocols',
          label: vm.$t('assets.Protocols'),
          type: 'select',
          el: {
            options: protocols
          }
        },
        {
          name: 'labels',
          label: vm.$t('assets.Label'),
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
          label: vm.$t('common.Comment')
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
