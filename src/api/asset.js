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

export function getDomainList(data) {
  return request({
    url: '/api/v1/assets/domains/',
    method: 'get',
    params: data
  })
}

export function getLabelList(data) {
  return request({
    url: '/api/v1/assets/labels/',
    method: 'get',
    params: data
  })
}

export function getCommandFilterList(data) {
  return request({
    url: '/api/v1/assets/cmd-filters/',
    method: 'get',
    params: data
  })
}

