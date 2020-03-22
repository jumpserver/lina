import request from '@/utils/request'

export function getAdminUserList(data) {
  return request({
    url: '/api/v1/assets/admin-users/',
    method: 'get',
    params: data
  })
}

export function getSystemUserList(data) {
  return request({
    url: '/api/v1/assets/system-users/',
    method: 'get',
    params: data
  })
}

