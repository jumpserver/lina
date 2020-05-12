import request from '@/utils/request'

export function getDashboard(data) {
  return request({
    url: '/api/v1/index/',
    method: 'get',
    data
  })
}
