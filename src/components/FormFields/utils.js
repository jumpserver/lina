import Select2 from '@/components/FormFields/Select2'

export function getSelect(url, label, transformOption, value, multiple = true, clearable = true) {
  if (!value) {
    value = multiple ? [] : ''
  }
  if (!transformOption) {
    transformOption = (item) => {
      return { label: item.name, value: item.id }
    }
  }
  return {
    label: label,
    component: Select2,
    el: {
      value: value,
      multiple: multiple,
      clearable: clearable,
      ajax: {
        url: url,
        transformOption: transformOption
      }
    }
  }
}

export function getSystemUserSelect2(url, value, multiple = true, clearable = true) {
  if (!url) {
    url = '/api/v1/assets/system-users/?fields_size=mini'
  }
  const transformOption = (item) => {
    let label = ''
    if (item.protocol === 'k8s') {
      label = item.name
    } else {
      const username = item.username || '*'
      label = `${item.name}(${username})`
    }
    return { label: label, value: item.id }
  }
  return getSelect(url, this.$t('assets.SystemUser'), transformOption, value, multiple, clearable)
}

export function getAssetSelect2(url, value, multiple = true, clearable = true) {
  if (!url) {
    url = '/api/v1/assets/assets/?fields_size=mini'
  }
  const transformOption = (item) => {
    return { label: item.hostname + '(' + item.ip + ')', value: item.id }
  }
  return getSelect(url, this.$t('assets.Asset'), transformOption, value, multiple, clearable)
}

export function getUserSelect2(url, value, multiple = true, clearable = true) {
  if (!url) {
    url = '/api/v1/users/users/?fields_size=mini'
  }
  const transformOption = (item) => {
    return { label: item.name + '(' + item.username + ')', value: item.id }
  }
  return getSelect(url, this.$t('users.User'), transformOption, value, multiple, clearable)
}

export function getAppSelect2(url, value, multiple = true, clearable = true) {
  if (!url) {
    url = '/api/v1/applications/applications/?fields_size=mini'
  }
  const transformOption = (item) => {
    return { label: item.name + '(' + item.username + ')', value: item.id }
  }
  return getSelect(url, this.$t('users.User'), transformOption, value, multiple, clearable)
}
