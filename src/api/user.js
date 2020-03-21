import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/vue-admin-template/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/api/v1/users/profile/',
    method: 'get'
    // params: { token }
  })
}

export function getUserList(data) {
  return request({
    url: '/api/v1/users/users/',
    method: 'get',
    params: data
  })
}
export function getUserGroupList(data) {
  return request({
    url: '/api/v1/users/groups/',
    method: 'get',
    params: data
  })
}
export function getUserGroup(data) {
  return request({
    url: '/api/v1/users/groups/' + data + '/',
    method: 'get'
  })
}

export function editUserGroup(data) {
  return request({
    url: '/api/v1/users/groups/',
    method: 'post',
    data: data
  })
}
export function updateUserGroup(id, data) {
  return request({
    url: '/api/v1/users/groups/' + id + '/',
    method: 'put',
    data: data
  })
}

export function logout() {
  return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
  })
}
