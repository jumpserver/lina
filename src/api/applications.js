import request from '@/utils/request'

export function getRemoteAppList(data) {
  return request({
    url: '/api/v1/applications/remote-apps/',
    method: 'get',
    params: data
  })
}
export function getDatabaseAppList(data) {
  return request({
    url: '/api/v1/applications/database-apps/',
    method: 'get',
    params: data
  })
}
