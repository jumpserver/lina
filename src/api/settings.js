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

export function testLdapSetting(data, refresh = true) {
  let url = '/api/v1/settings/ldap/testing/config/'
  if (refresh) {
    url = url + '?refresh=1'
  }
  return new Promise((resolve, reject) => {
    request({
      disableFlashErrorMsg: true,
      url: url,
      method: 'post',
      data: data
    }).then(res => {
      if (res.status !== 'running') {
        resolve(res)
      } else {
        setTimeout(() => {
          resolve(testLdapSetting(data, false))
        }, 1000)
      }
    }).catch(error => {
      reject(error)
    })
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
    url: '/api/v1/xpack/interface/setting/',
    method: 'get'
  })
}

export function getPreference() {
  return request({
    url: '/api/v1/users/preference/?category=luna',
    method: 'get'
  })
}
