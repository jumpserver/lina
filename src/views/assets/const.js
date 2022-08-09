import i18n from '@/i18n/i18n'
import ProtocolSelector from '@/components/FormFields/ProtocolSelector'
import AssetAccounts from '@/components/FormFields/AssetAccounts'
import rules from '@/components/DataForm/rules'

export const assetFieldsMeta = (vm) => {
  return {
    ip: {
      label: i18n.t('assets.ipDomain')
    },
    protocols: {
      component: ProtocolSelector,
      on: {
        input: ([value], updateForm) => {
          vm.fieldsMeta.accounts.el.protocols = value.map(item => {
            return item.split('/')[0]
          })
        }
      },
      el: {}
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
    }
  }
}

