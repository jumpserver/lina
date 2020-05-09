import request from '@/utils/request'

export function getSettings() {
  return request({
    url: `/api/v1/settings/setting/`,
    method: 'get'
  })
}

export function testEmailSetting(data) {
  return request({
    url: '/api/v1/settings/mail/testing/',
    method: 'post',
    data: data
  })
}

export function testLdapSetting(data) {
  return request({
    url: '/api/v1/settings/ldap/testing/config/',
    method: 'post',
    data: data
  })
}

export function testLdapUserLogin(data) {
  return request({
    url: '/api/v1/settings/ldap/testing/login/',
    method: 'post',
    data: data
  })
}

export function refreshLdapUserCache() {
  return request({
    url: '/api/v1/settings/ldap/cache/refresh/',
    method: 'get'
  })
}

export function importLdapUser(data) {
  return request({
    url: '/api/v1/settings/ldap/users/import/',
    method: 'post',
    data: data
  })
}
