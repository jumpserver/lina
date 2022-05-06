import request from '@/utils/request'

export function getSettings() {
  return request({
    url: `/api/v1/settings/setting/`,
    method: 'get'
  })
}

export function testEmailSetting(data) {
  return request({
    disableFlashErrorMsg: true,
    url: '/api/v1/settings/mail/testing/',
    method: 'post',
    data: data
  })
}
export function importLicense(formData) {
  return request({
    url: '/api/v1/xpack/license/import',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
}
export function testLdapSetting(data) {
  return request({
    disableFlashErrorMsg: true,
    url: '/api/v1/settings/ldap/testing/config/',
    method: 'post',
    data: data
  })
}

export function testLdapUserLogin(data) {
  return request({
    disableFlashErrorMsg: true,
    url: '/api/v1/settings/ldap/testing/login/',
    method: 'post',
    data: data
  })
}

export function refreshLdapUserCache() {
  return request({
    disableFlashErrorMsg: true,
    url: '/api/v1/settings/ldap/cache/refresh/',
    method: 'get'
  })
}

export function startLdapUserCache() {
  return request({
    disableFlashErrorMsg: true,
    url: '/api/v1/settings/ldap/users/?cache_police=1',
    method: 'get'
  })
}

export function importLdapUser(data) {
  return request({
    disableFlashErrorMsg: true,
    url: '/api/v1/settings/ldap/users/import/',
    method: 'post',
    data: data
  })
}

export function getPublicSettings(isOpen) {
  let url
  if (isOpen) {
    url = '/api/v1/settings/public/open/'
  } else {
    url = '/api/v1/settings/public/'
  }
  return request({
    url: url,
    method: 'get'
  })
}
export function getLogo() {
  return request({
    url: '/api/v1/xpack/interface/setting',
    method: 'get'
  })
}
