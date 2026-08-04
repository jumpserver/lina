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
  return request({
    url: url,
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
