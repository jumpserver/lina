import i18n from '@/i18n/i18n'
import ProtocolSelector from '@/components/FormFields/ProtocolSelector'
import AssetAccounts from '@/components/FormFields/AssetAccounts'
import rules from '@/components/DataForm/rules'
import { Select2 } from '@/components/FormFields'

export const assetFieldsMeta = () => {
  return {
    ip: {
      label: i18n.t('assets.ipDomain')
    },
    protocols: {
      component: ProtocolSelector,
      on: {},
      el: {
        settingReadonly: true,
        choices: []
      }
    },
    platform: {
      el: {
        multiple: false,
        disabled: true,
        ajax: {
          url: '/api/v1/assets/platforms/',
          transformOption: (item) => {
            return { label: `${item.name}`, value: item.id }
          }
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
      label: '',
      el: {
        protocols: [],
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
      el: {
        ajax: {
          url: '/api/v1/assets/labels/',
          transformOption: (item) => {
            return { label: `${item.name}:${item.value}`, value: item.id }
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
    }
  }
}

export const Categories = [
  {
    title: '主机',
    name: 'host'
  },
  {
    title: '网络设备',
    name: 'networking'
  },
  {
    title: '数据库',
    name: 'database'
  },
  {
    title: '云平台',
    name: 'cloud'
  },
  {
    title: 'Web',
    name: 'web'
  }
]
