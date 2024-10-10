
export function GetUrl(baseUrl, instanceId, type) {
  let url = baseUrl
  if (instanceId) {
    url = `${url}${instanceId}/`
  }
  return `${url}?type=${type}`
}

export function cleanForm(value) {
  value.meta.INDEX = value.meta?.INDEX?.toLowerCase()
  // 解决第一次提交失败后，再次提交时，HOSTS字段为Array的问题
  if (typeof value.meta.HOSTS === 'string') {
    value.meta.HOSTS = value.meta.HOSTS.split(',').map(item => (item.trim()))
  }
  return value
}
