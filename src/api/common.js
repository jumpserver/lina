import request from '@/utils/request'

export function createSourceIdCache(ids) {
  ids = ids.map((item) => {
    if (typeof item === 'object' && item.id) {
      return item.id
    } else {
      return item
    }
  })
  return request({
    url: '/api/v1/common/resources/cache/',
    method: 'post',
    data: { resources: ids }
  })
}

export function optionUrlMeta(url) {
  const suffixIndex = url.search(/[?#]/)
  const path = suffixIndex === -1 ? url : url.slice(0, suffixIndex)
  const suffix = suffixIndex === -1 ? '' : url.slice(suffixIndex)
  const normalizedUrl = path.endsWith('/') ? url : `${path}/${suffix}`

  return request({
    url: normalizedUrl,
    method: 'options'
  })
}

export function getActionMeta(meta, method = 'GET') {
  const normalizedMethod = String(method || 'GET').toUpperCase()
  return meta?.actions?.[normalizedMethod] || {}
}

export function getFilterMeta(meta) {
  return meta?.filters || {}
}

export function getOrderingMeta(meta) {
  return meta?.ordering || {}
}

export function getSearchMeta(meta) {
  return meta?.search || {}
}
