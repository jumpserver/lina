import i18n from '@/i18n/i18n'
import { attrMatchOptions } from '@/components/const'

export const resourceTypeOptions = [
  { label: i18n.t('Platform'), value: 'platform' },
  { label: i18n.t('Node'), value: 'node' },
  { label: i18n.t('Zone'), value: 'domain' },
  { label: i18n.t('AccountTemplate'), value: 'account_template' },
  { label: i18n.t('Strategy'), value: 'name_strategy' }
]

export const instanceAttrOptions = [
  { label: i18n.t('InstanceName'), value: 'instance_name' },
  { label: i18n.t('InstancePlatformName'), value: 'instance_platform' },
  { label: i18n.t('InstanceAddress'), value: 'instance_address' }
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
