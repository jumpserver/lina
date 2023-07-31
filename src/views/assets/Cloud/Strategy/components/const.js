import i18n from '@/i18n/i18n'
import { attrMatchOptions } from '@/components/const'

export const resourceTypeOptions = [
  { label: i18n.t('assets.Platform'), value: 'platform' },
  { label: i18n.t('assets.Node'), value: 'node' },
  { label: i18n.t('assets.Domain'), value: 'domain' },
  { label: i18n.t('accounts.AccountTemplate'), value: 'account_template' }
]

export const instanceAttrOptions = [
  { label: i18n.t('xpack.Cloud.InstanceName'), value: 'instance_name' },
  { label: i18n.t('xpack.Cloud.InstancePlatformName'), value: 'instance_platform' },
  { label: i18n.t('xpack.Cloud.InstanceAddress'), value: 'instance_address' }
]

export const tableFormatter = (colName, getResourceLabel) => {
  return (row, col, cellValue) => {
    const globalResource = {}
    const value = cellValue
    if (value?.label) { return value.label }
    switch (colName) {
      case 'attr':
        return instanceAttrOptions.find(attr => attr.value === value)?.label || value
      case 'resource_type':
        return resourceTypeOptions.find(attr => attr.value === value)?.label || value
      case 'match':
        return attrMatchOptions.find(opt => opt.value === value).label || value
      case 'value':
        return Array.isArray(value) ? value.join(', ') : value
      case 'resource':
        if (typeof getResourceLabel === 'function') {
          Object.assign(globalResource, getResourceLabel())
        }
        return globalResource[value] || value
      case 'protocols':
        return Array.isArray(value) ? value.map(p => { return `${p.name}/${p.port}` }).join(', ') : ''
      case 'count':
        return value?.length || 0
      default:
        return value
    }
  }
}
