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

export function getUserAssetGrantedSystemUsers(userId, assetId) {
  return request({
    url: `/api/v1/perms/users/${userId}/assets/${assetId}/system-users/?cache_policy=1`,
    method: 'get'
  })
}

export function getMyAssetGrantedSystemUsers(userId, assetId) {
  return request({
    url: `/api/v1/perms/users/assets/${assetId}/system-users/?cache_policy=1`,
    method: 'get'
  })
}

export function getUserGroupAssetGrantedSystemUsers(gId, assetId) {
  return request({
    url: `/api/v1/perms/user-groups/${gId}/assets/${assetId}/system-users/?cache_policy=1`,
    method: 'get'
  })
}
