import request from '@/utils/request'

export function getAssetPermissionList(data) {
  return request({
    url: '/api/v1/perms/asset-permissions/',
    method: 'get',
    params: data
  })
}

export function getRemoteAppPermissionList(data) {
  return request({
    url: '/api/v1/perms/remote-app-permissions/',
    method: 'get',
    params: data
  })
}
export function getDatabaseAppPermissionList(data) {
  return request({
    url: '/api/v1/perms/database-app-permissions/',
    method: 'get',
    params: data
  })
}
