import request from '@/utils/request'

export function getSettings() {
  return request({
    url: `/api/v1/settings/setting/`,
    method: 'get'
  })
}
