import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/vue-admin-template/user/login',
    method: 'post',
    data
  })
}

export async function getProfile(token) {
  let profile = await request({
    url: '/api/v1/users/profile/',
    method: 'get'
  })
  const perms = await request({
    url: '/api/v1/users/profile/permissions/',
    method: 'get'
  })
  profile = {
    ...profile,
    ...perms
  }
  return profile
}

export function getUserList(data) {
  return request({
    url: '/api/v1/users/users/',
    method: 'get',
    params: data
  })
}

export function getUserGroupList(params) {
  return request({
    url: '/api/v1/users/groups/',
    method: 'get',
    params: params
  })
}

export function getUserGroupDetail(id) {
  return request({
    url: `/api/v1/users/groups/${id}/`,
    method: 'get'
  })
}

export function getUserGroupMembers(id) {
  return request({
    url: `/api/v1/users/users-groups-relations/?usergroup=${id}`,
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

export default {
  getProfile,
  getUserList
}
