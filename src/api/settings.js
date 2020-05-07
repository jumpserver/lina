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
