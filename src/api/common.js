import request from '@/utils/request'

export function createSourceIdCache(ids) {
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
