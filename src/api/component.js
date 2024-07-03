import request from '@/utils/request'

export function getLokiLog(data) {
  return request({
    url: `/api/v1/terminal/loki/logs/`,
    method: 'get',
    params: data
  })
}
