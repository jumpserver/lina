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

export function logout() {
  return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
  })
}
