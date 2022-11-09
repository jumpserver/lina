import request from '@/utils/request'

export function createSourceIdCache(ids) {
  ids = ids.map(item => {
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
