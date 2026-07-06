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

  if (!meta || typeof meta !== 'object') {
    return {}
  }

  if (meta.actions && typeof meta.actions === 'object') {
    return meta.actions[normalizedMethod] || {}
  }

  if (meta[normalizedMethod] && typeof meta[normalizedMethod] === 'object') {
    return meta[normalizedMethod]
  }

  const looksLikeFieldMap = Object.values(meta).some((value) => {
    return (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      ('label' in value || 'type' in value || 'children' in value)
    )
  })

  return looksLikeFieldMap ? meta : {}
}
