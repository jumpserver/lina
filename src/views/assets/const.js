import i18n from '@/i18n/i18n'
import { groupedDropdownToCascader } from '@/utils/common'
import ProtocolSelector from '@/components/FormFields/ProtocolSelector'
import rules from '@/components/DataForm/rules'

export const AssetProtocols = [
  {
    title: 'SSH',
    name: 'SSH',
    type: 'primary',
    group: i18n.t('assets.HostProtocol'),
    has: true
  },
  {
    title: 'RDP',
    name: 'RDP',
    type: 'primary',
    has: true
  },
  {
    title: 'VNC',
    name: 'VNC',
    type: 'primary',
    has: true
  },
  {
    title: 'Telnet',
    name: 'Telnet',
    type: 'primary',
    has: true
  }
]

export const AssetCascader = groupedDropdownToCascader(AssetProtocols)

export const assetFieldsMeta = {
  protocols: {
    component: ProtocolSelector
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
    el: {
      multiple: false,
      clearable: true,
      ajax: {
        url: '/api/v1/assets/domains/'
      }
    }
  },
  admin_user: {
    el: {
      multiple: false,
      ajax: {
        url: '/api/v1/assets/system-users/?type=admin',
        transformOption: (item) => {
          const username = item.username || '*'
          return { label: item.name + '(' + username + ')', value: item.id }
        }
      }
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

