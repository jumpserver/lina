import request from '@/utils/request'

export function terminateSession(data) {
  return request({
    url: '/api/v1/terminal/tasks/kill-session/',
    method: 'post',
    data: data
  })
}
