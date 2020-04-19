import request from '@/utils/request'

export function getAssetPermissionDetail(id) {
  return request({
    url: `/api/v1/perms/asset-permissions/${id}/`,
    method: 'get'
  })
}

export function getRemoteAppPermissionDetail(id) {
  return request({
    url: `/api/v1/perms/remote-app-permissions/${id}/`,
    method: 'get'
  })
}

export function getDatabaseAppPermissionDetail(id) {
  return request({
    url: `/api/v1/perms/database-app-permissions/${id}/`,
    method: 'get'
  })
}
