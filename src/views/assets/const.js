import i18n from '@/i18n/i18n'
import { groupedDropdownToCascader } from '@/utils/common'

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

